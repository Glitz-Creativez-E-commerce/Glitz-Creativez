import fetch from 'node-fetch';

async function testOrders() {
    try {
        // 1. Login to get token (assuming hardcoded admin for test or just hitting public if possible... wait, need admin)
        // Since we can't easily login without credentials, let's try to access the DB directly using mongoose if possible,
        // or just rely on the user to check the terminal.
        // Actually, I can use the seed script logic to check DB.

        // Better approach: verify the code I wrote logic.
        // But first, let's check if we can hit the endpoint.
        // I'll assume localhost:5000 is running.

        console.log("Checking API availability...");
        const res = await fetch('http://localhost:5000/api/products'); // Public endpoint
        console.log("Products endpoint status:", res.status);

        // I can't hit admin/all without token.
        // I will try to read the seedData.js to see if there are default credentials I can use to login and get a token.

    } catch (error) {
        console.error("Error:", error);
    }
}

testOrders();
