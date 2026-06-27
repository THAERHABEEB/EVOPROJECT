require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setup() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS building (
        id SERIAL PRIMARY KEY,
        building_loc VARCHAR(50),
        room_num VARCHAR(50),
        floor VARCHAR(10),
        room_name VARCHAR(255)
      );
    `);
    
    await pool.query('ALTER TABLE building ADD COLUMN IF NOT EXISTS floor VARCHAR(10);');
    await pool.query('ALTER TABLE building ADD COLUMN IF NOT EXISTS room_name VARCHAR(255);');
    await pool.query('ALTER TABLE building DROP CONSTRAINT IF EXISTS building_room_num_key;');

    await pool.query('TRUNCATE TABLE building RESTART IDENTITY CASCADE;');

    await pool.query(`
INSERT INTO building (building_loc, room_num, floor, room_name) VALUES
('A','1','0', 'Aمدرج'),
('A','2','0','مكتب الشؤون الاداريه'),
('A', '3', '0','مكتب مدير عام لامن ' ),
('A', 'A01', '0', 'Simulation LAB'),
('A','A02','0','معمل'),
('A','5','1', 'مكتب الكوريين'),
('A','6','1', 'امين عام الجامعه'),
('A','7','1', 'Simu LAB'),
('A','8','1', 'Computer and Simution'),
('A','9','1', 'plc'),
('A','10','1', 'برتفوليو الجوده '),
('A','11','1', 'Student WC'),
('A','12','1', ' Admin WC'),
('A','13','2', 'مكتب نائب الجامعه'),
('A','14','2', 'A207'),
('A','15','2', 'A203'),
('A','16','2', 'A202'),
('A','17','3', 'A307'),
('A','18','3', 'A306'),
('A','19','3', 'A305'),
('A','20','3', 'A304'),
('A','21','3', 'A303'),
('A','22','3', 'Student WC'),
('D', '101', '1', 'D101'),
('D', '102', '1', 'D102'),
('D', '103', '1', 'D103'),
('D', '104', '1', 'D104'),
('D', '105', '1', 'D105'),
('D', '106', '1', 'D106'),
('D', '107', '1', 'D107'),
('D','23','1', 'Student WC'),
('D', '24', '2', 'الكنترول'),
('D', '25', '2', 'مكتب العميد'),
('D', '26', '2', 'سكرتاريه'),
('D', '27', '2', 'مكتب استاذ احمد صلاح'),
('D','28','2', 'Student WC'),
('D', '115', '3', 'مكتب دكتور سيمون'),
('D', '116', '3', 'D116'),
('D', '117', '3', 'منسقي المشروع'),
('D', '118', '3', 'D118'),
('D', '119', '3', 'D119'),
('D', '120', '3', 'مكتب منسقي برنامج ميكاترونكس د/احمد سويدان'),
('D', '121', '3', 'D121'),
('D','29','3', 'Student WC'),
('C', '101', '1', 'C101 '),
('C', 'C102', '1','قسم الالكترونيات'),
('C','30','1', 'Student WC'),
('C', '103', '2', 'C103'),
('C', '104', '2', 'C104'),
('C', '105', '2', 'C105'),
('C','31','2', 'Student WC'),
('C', '106', '3', 'C106'),
('C', '107', '3', 'C107'),
('C', '108', '3', 'C108'),
('C', '109', '3', 'C109'),
('G', 'G_WC', '0', 'Student WC'),
('G', '101', '0', 'G101'),
('G', '102', '0', 'مركز الرعاية والشباب'),
('G', '103', '0', 'G103'),
('G', '104', '0', 'G104'),
('G', '105', '0', 'G105 '),
('G', '106', '0', 'G106'),
('G', '107', '0', 'G107'),
('G', '32', '0', 'شؤون  الطلبه'),
('G', '201', '1', NULL),
('G', '202', '1', NULL),
('G', '203', '1', NULL),
('G', '32', '1', 'مكتب اداري'),
('G', '204', '1', 'G204'),
('G', '205', '1', 'G205'),
('G', '33', '1', 'ادارة التدريب'),
('G', '206', '1', 'G206'),
('G', '207', '1', 'G207'),
('G', '208', '1', 'G208'),
('G', '209', '1', 'G209'),
('F', 'F_HALL', '0', 'قاعة'),
('F', 'F_WC', '0', 'Student WC'),
('F', 'F_STUDENT', '0', 'شؤون طلبة'),
('F', '101', '0', 'Electrical Installation Lab'),
('F', '102', '0', 'Mechatronics lab (2)'),
('F', '103', '0', 'Mechatronics lab (1)'),
('F', '104', '0', 'Electrical power system'),
('F', '105', '0', 'Networking'),
('F', '106', '0', 'Mechanical Measurements lab'),
('F', '107', '0', 'Electrical engineering lab'),
('F', '108', '0', 'Electronics lab'),
('F', '109', '0', 'Telecommunication lab'),
('F', '110', '0', 'Electrical Instalation');
    `);
    console.log("Building table setup successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
setup();
