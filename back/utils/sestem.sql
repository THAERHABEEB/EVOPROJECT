CREATE TABLE "USER" (
    ID SERIAL PRIMARY KEY,
    NAME VARCHAR(255) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(50),
    Remember_token VARCHAR(255),
    LastLogin TIMESTAMP,
    Created_at TIMESTAMP,
    Updated_in TIMESTAMP
);

CREATE TABLE Students (
    ID SERIAL PRIMARY KEY,
    CODE VARCHAR(50) UNIQUE NOT NULL,
    NAME VARCHAR(255) NOT NULL,
    USER_ID INT UNIQUE,
    Phone VARCHAR(20),
    Address VARCHAR(255),
    Department VARCHAR(100),
    Photo VARCHAR(255),
    Date_of_Birth DATE,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Age INT,
    Current_Semester VARCHAR(50),
    Year_level INT,
    Status VARCHAR(50),
    FOREIGN KEY (USER_ID) REFERENCES "USER"(ID)
);

CREATE TABLE Doctor (
    ID SERIAL PRIMARY KEY,
    NAME VARCHAR(255) NOT NULL,
    USER_ID INT UNIQUE,
    Department VARCHAR(100),
    OfficeLocation VARCHAR(255),
    qualification VARCHAR(255),
    Photo VARCHAR(255),
    Email VARCHAR(255) UNIQUE NOT NULL,
    FOREIGN KEY (USER_ID) REFERENCES "USER"(ID)
);

CREATE TABLE Admin (
    ID SERIAL PRIMARY KEY,
    USER_id INT UNIQUE,
    Code VARCHAR(50) UNIQUE NOT NULL,
    Created_date TIMESTAMP,
    Permission TEXT,
    FOREIGN KEY (USER_id) REFERENCES "USER"(ID)
);

CREATE TABLE Student_Affairs (
    ID SERIAL PRIMARY KEY,
    USER_ID INT UNIQUE,
    CODE VARCHAR(50) UNIQUE NOT NULL,
    Responsibilities TEXT,
    FOREIGN KEY (USER_ID) REFERENCES "USER"(ID)
);

CREATE TABLE Specialization (
    ID SERIAL PRIMARY KEY,
    NAME VARCHAR(255) NOT NULL,
    CODE VARCHAR(50) UNIQUE NOT NULL,
    Description TEXT
);

CREATE TABLE Semesters (
    ID SERIAL PRIMARY KEY,
    spec_id INT,
    NAME VARCHAR(255) NOT NULL,
    Description TEXT,
    Start_date DATE,
    End_date DATE,
    Build_id VARCHAR(50),
    FOREIGN KEY (spec_id) REFERENCES Specialization(ID)
);

CREATE TABLE Study_Plan (
    ID SERIAL PRIMARY KEY,
    Spec_id INT,
    Year_name VARCHAR(100),
    Model TEXT,
    FOREIGN KEY (Spec_id) REFERENCES Specialization(ID)
);

CREATE TABLE Course (
    ID SERIAL PRIMARY KEY,
    NAME VARCHAR(255) NOT NULL,
    Credit_hours INT,
    Description TEXT,
    Specialization_id INT,
    Doctor_id INT,
    Year_level INT,
    FOREIGN KEY (Specialization_id) REFERENCES Specialization(ID),
    FOREIGN KEY (Doctor_id) REFERENCES Doctor(ID)
);

CREATE TABLE Building (
    ID SERIAL PRIMARY KEY,
    Room_Num VARCHAR(50) UNIQUE NOT NULL,
    Building_loc VARCHAR(255)
);

CREATE TABLE Lecture (
    ID SERIAL PRIMARY KEY,
    Doctor_id INT,
    Course_id INT,
    Room_id INT,
    FOREIGN KEY (Doctor_id) REFERENCES Doctor(ID),
    FOREIGN KEY (Course_id) REFERENCES Course(ID),
    FOREIGN KEY (Room_id) REFERENCES Building(ID)
);

CREATE TABLE Lecture_materials (
    ID SERIAL PRIMARY KEY,
    lecture_id INT,
    NAME VARCHAR(255) NOT NULL,
    Folder VARCHAR(255),
    File_type VARCHAR(50),
    File_size VARCHAR(50),
    Uploaded_by INT,
    FOREIGN KEY (lecture_id) REFERENCES Lecture(ID),
    FOREIGN KEY (Uploaded_by) REFERENCES "USER"(ID)
);

CREATE TABLE Assignment (
    ID SERIAL PRIMARY KEY,
    Lec_mat_id INT,
    student_id INT,
    Title VARCHAR(255) NOT NULL,
    Start_date TIMESTAMP,
    End_date TIMESTAMP,
    FOREIGN KEY (Lec_mat_id) REFERENCES Lecture_materials(ID),
    FOREIGN KEY (student_id) REFERENCES Students(ID)
);

CREATE TABLE Enrollments (
    ID SERIAL PRIMARY KEY,
    Student_id INT,
    Course_id INT,
    Spec_id INT,
    Date_end DATE,
    FOREIGN KEY (Student_id) REFERENCES Students(ID),
    FOREIGN KEY (Course_id) REFERENCES Course(ID),
    FOREIGN KEY (Spec_id) REFERENCES Specialization(ID)
);

CREATE TABLE Grade (
    ID SERIAL PRIMARY KEY,
    Student_id INT,
    Course_id INT,
    Semester_id INT,
    Mid_Grades DECIMAL(5,2),
    Final_Grades DECIMAL(5,2),
    Sup_Grades DECIMAL(5,2),
    Letter_Grades VARCHAR(5),
    FOREIGN KEY (Student_id) REFERENCES Students(ID),
    FOREIGN KEY (Course_id) REFERENCES Course(ID),
    FOREIGN KEY (Semester_id) REFERENCES Semesters(ID)
);

CREATE TABLE Attendance (
    ID SERIAL PRIMARY KEY,
    Student_id INT,
    Lecture_id INT,
    Status VARCHAR(50),
    Duration INT,
    Join_time TIMESTAMP,
    Leave_time TIMESTAMP,
    FOREIGN KEY (Student_id) REFERENCES Students(ID),
    FOREIGN KEY (Lecture_id) REFERENCES Lecture(ID)
);

CREATE TABLE Live (
    ID SERIAL PRIMARY KEY,
    Course_id INT,
    Lec_id INT,
    Student_id INT,
    Doctor_id INT,
    title VARCHAR(255),
    Start_date TIMESTAMP,
    End_date TIMESTAMP,
    FOREIGN KEY (Course_id) REFERENCES Course(ID),
    FOREIGN KEY (Lec_id) REFERENCES Lecture(ID),
    FOREIGN KEY (Student_id) REFERENCES Students(ID),
    FOREIGN KEY (Doctor_id) REFERENCES Doctor(ID)
);

CREATE TABLE FAQ (
    ID SERIAL PRIMARY KEY,
    Question TEXT,
    Answer TEXT,
    Student_id INT,
    Doctor_id INT,
    Is_active BOOLEAN,
    Rating INT,
    FOREIGN KEY (Student_id) REFERENCES Students(ID),
    FOREIGN KEY (Doctor_id) REFERENCES Doctor(ID)
);

CREATE TABLE Messages (
    ID SERIAL PRIMARY KEY,
    Sender INT,
    Resever INT,
    User_id INT,
    content TEXT,
    Is_read BOOLEAN,
    Send_at TIMESTAMP,
    Reply TEXT,
    FOREIGN KEY (Sender) REFERENCES "USER"(ID),
    FOREIGN KEY (Resever) REFERENCES "USER"(ID),
    FOREIGN KEY (User_id) REFERENCES "USER"(ID)
);

CREATE TABLE News (
    ID SERIAL PRIMARY KEY,
    User_id INT,
    Title VARCHAR(255) NOT NULL,
    Content TEXT,
    Img_url VARCHAR(255),
    Created_at TIMESTAMP,
    Type_size VARCHAR(50),
    Author VARCHAR(255),
    FOREIGN KEY (User_id) REFERENCES "USER"(ID)
);

CREATE TABLE Library (
    ID SERIAL PRIMARY KEY,
    Doctor_id INT,
    Title VARCHAR(255) NOT NULL,
    Author VARCHAR(255),
    isbn VARCHAR(50) UNIQUE,
    Description TEXT,
    Category VARCHAR(100),
    Pdfurl VARCHAR(255),
    Coverimage VARCHAR(255),
    Updated_at TIMESTAMP,
    FOREIGN KEY (Doctor_id) REFERENCES Doctor(ID)
);

CREATE TABLE Request_type (
    ID SERIAL PRIMARY KEY,
    Type_Key VARCHAR(50) UNIQUE NOT NULL,
    Title VARCHAR(255) NOT NULL
);

CREATE TABLE Student_Request (
    ID SERIAL PRIMARY KEY,
    student_id INT,
    Type_request_id INT,
    Status VARCHAR(50),
    Request_Docum VARCHAR(255),
    Create_at TIMESTAMP,
    Viewed_by INT,
    FOREIGN KEY (student_id) REFERENCES Students(ID),
    FOREIGN KEY (Type_request_id) REFERENCES Request_type(ID),
    FOREIGN KEY (Viewed_by) REFERENCES "USER"(ID)
);

CREATE TABLE Control (
    ID SERIAL PRIMARY KEY,
    User_id INT,
    Grade_id INT,
    CODE VARCHAR(50) UNIQUE NOT NULL,
    Permission TEXT,
    FOREIGN KEY (User_id) REFERENCES "USER"(ID),
    FOREIGN KEY (Grade_id) REFERENCES Grade(ID)
);

CREATE TABLE Upload_Grades (
    ID SERIAL PRIMARY KEY,
    Course_id INT,
    Doctor_id INT,
    Control_id INT,
    Spec_id INT,
    File_name VARCHAR(255),
    Folder VARCHAR(255),
    year_level INT,
    status VARCHAR(50),
    Upload_date TIMESTAMP,
    Approval BOOLEAN,
    FOREIGN KEY (Course_id) REFERENCES Course(ID),
    FOREIGN KEY (Doctor_id) REFERENCES Doctor(ID),
    FOREIGN KEY (Control_id) REFERENCES Control(ID),
    FOREIGN KEY (Spec_id) REFERENCES Specialization(ID)
);