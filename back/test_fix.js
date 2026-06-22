
async function testSubmit() {
    try {
        const payload = {
            course_id: 1, // Assuming course 1 exists from grades.sql
            doctor_id: 1,
            grades: [
                { id: 1, name: 'Ahmed Mohamed', mid_grades: 25, final_grades: 50, sup_grades: 0, letter_grades: 'B' }
            ]
        };
        
        console.log('Testing grade submission...');
        // We'll use fetch directly since we are in a node environment and lib/api.js uses fetch
        const response = await fetch('http://localhost:5000/api/upload_grades/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // We might need a token if authenticateToken is active
            },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Body:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testSubmit();
