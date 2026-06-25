/*
 * =====================================================================
 *   Smart Attendance System - CONNECTED TO CLOUD API
 * =====================================================================
 *
 *  Required Libraries:
 *  - MFRC522
 *  - LiquidCrystal_I2C
 *
 * =====================================================================
 */

#include <SPI.h>
#include <MFRC522.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// ====================== Configuration ======================
const char* ssid     = "PABLO";        // <- your WiFi name
const char* password = "51151155";    // <- your WiFi password

// BACKEND API URL (Replace with your Railway URL or Local IP)
const char* API_URL  = "https://evo-backend-production-553a.up.railway.app/api/attendance/rfid"; 
// Example: "https://evo-backend-production.up.railway.app/api/attendance/rfid"
// Or Local: "http://192.168.1.15:10000/api/attendance/rfid"

// ====================== Pin Definitions ======================
#define BUZZER_PIN  13
#define SS_ENTRY     5
#define RST_ENTRY   27
#define SS_EXIT      4
#define RST_EXIT    15

MFRC522 rfidEntry(SS_ENTRY, RST_ENTRY);
MFRC522 rfidExit (SS_EXIT,  RST_EXIT);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ====================== Helper: Parse JSON String ======================
String getJsonValue(String json, String key) {
  int keyIdx = json.indexOf("\"" + key + "\":");
  if (keyIdx == -1) return "";
  int valStart = json.indexOf("\"", keyIdx + key.length() + 2) + 1;
  int valEnd = json.indexOf("\"", valStart);
  return json.substring(valStart, valEnd);
}

// ====================== LCD line (auto-pad to 16 chars) ======================
void lcdLine(int row, String text) {
  lcd.setCursor(0, row);
  while (text.length() < 16) text += " ";
  if (text.length() > 16) text = text.substring(0, 16);
  lcd.print(text);
}

// ====================== Read UID ======================
String getUID(MFRC522 &rfid) {
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}

// ====================== Handle Card Scan (API Request) ======================
void handleCard(MFRC522 &rfid, bool isEntry) {
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;

  lcd.backlight();
  lcd.clear();

  String uid = getUID(rfid);
  Serial.println("[SCAN] UID: " + uid);
  lcdLine(0, "Checking Cloud..");
  lcdLine(1, "UID: " + uid);

  // Stop reading so we don't scan twice rapidly
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();

  if (WiFi.status() != WL_CONNECTED) {
    lcdLine(0, "WiFi Disconnected");
    lcdLine(1, "Cannot log data");
    tone(BUZZER_PIN, 500, 1000);
    delay(3000);
    lcd.clear(); lcd.noBacklight();
    return;
  }

  // --- Make API Request (Fix for HTTPS) ---
  WiFiClientSecure client;
  client.setInsecure(); // Accept any HTTPS certificate
  HTTPClient http;
  http.begin(client, API_URL);
  http.addHeader("Content-Type", "application/json");

  String payload = "{\"uid\":\"" + uid + "\",\"type\":\"" + (isEntry ? "entry" : "exit") + "\"}";
  int httpResponseCode = http.POST(payload);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("API Response: " + response);

    String status = getJsonValue(response, "status");
    
    if (status == "error") {
      String err = getJsonValue(response, "error");
      lcdLine(0, "Error!");
      lcdLine(1, err);
      tone(BUZZER_PIN, 500, 1000);
      delay(3000);
    } else if (status == "success") {
      String studentName = getJsonValue(response, "student");
      String message = getJsonValue(response, "message"); // Used if no active class
      
      if (message == "No active class") {
        lcdLine(0, "Welcome " + studentName);
        lcdLine(1, "No Class Now");
        tone(BUZZER_PIN, 1000, 200); delay(250); tone(BUZZER_PIN, 1200, 200);
        delay(2000);
      } else {
        String subject = getJsonValue(response, "subject");
        String doctor = getJsonValue(response, "doctor");

        if (isEntry) {
          lcdLine(0, "Welcome " + studentName);
          lcdLine(1, subject);
          tone(BUZZER_PIN, 1000, 200); delay(250); tone(BUZZER_PIN, 1200, 200);
          delay(2000);
          lcdLine(0, "Doctor:");
          lcdLine(1, doctor);
        } else {
          lcdLine(0, "Goodbye " + studentName);
          lcdLine(1, "EXIT REGISTERED");
          tone(BUZZER_PIN, 1200, 200); delay(250); tone(BUZZER_PIN, 1000, 200);
        }
        delay(2000);
      }
    }
  } else {
    Serial.print("Error on sending POST: ");
    Serial.println(httpResponseCode);
    lcdLine(0, "API Error");
    lcdLine(1, String(httpResponseCode));
    tone(BUZZER_PIN, 500, 1000);
    delay(3000);
  }

  http.end();
  
  delay(1000);
  lcd.clear();
  lcd.noBacklight();
}

// ====================== Setup ======================
void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfidEntry.PCD_Init();
  rfidExit.PCD_Init();
  lcd.init();
  lcd.backlight();
  pinMode(BUZZER_PIN, OUTPUT);

  // Connect WiFi
  lcdLine(0, "Connecting WiFi");
  lcdLine(1, ssid);
  Serial.print("Connecting WiFi");
  WiFi.begin(ssid, password);

  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 20) {
    delay(500); Serial.print("."); tries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi OK: " + WiFi.localIP().toString());
    lcd.clear();
    lcdLine(0, "WiFi Connected!");
    lcdLine(1, WiFi.localIP().toString());
  } else {
    Serial.println("\nWiFi FAILED");
    lcd.clear();
    lcdLine(0, "No WiFi!");
  }

  delay(2000);
  lcd.clear();
  lcdLine(0, "SYSTEM READY");
  lcdLine(1, "SCAN YOUR CARD");

  delay(2000);
  lcd.clear();
  lcd.noBacklight();
}

// ====================== Loop ======================
void loop() {
  handleCard(rfidEntry, true);   // entry reader
  delay(100);
  handleCard(rfidExit,  false);  // exit reader
  delay(100);
}