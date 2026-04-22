
const login = async () => {
    console.log('Logging in as Admin...');
    const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '1111111111', countryCode: '+91', password: 'admin123' })
    });
    const data = await res.json();
    console.log('Login Status:', res.status);
    if (res.status !== 200) console.log('Login Error:', data);
    return data.data ? data.data.token : null;
};

const fetchProducts = async (token) => {
    console.log('Fetching /api/products/all...');
    const res = await fetch('http://localhost:5000/api/products/all', {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Fetch Status:', res.status);

    if (res.status === 200) {
        const data = await res.json();
        console.log('Total Products:', data.data ? data.data.length : 'Unknown structure');
    } else {
        const text = await res.text();
        console.log('Error Body:', text);
    }

    console.log('Fetching /api/auth/admin/users...');
    const userRes = await fetch('http://localhost:5000/api/auth/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log('User Fetch Status:', userRes.status);
    if (userRes.status === 200) {
        const userData = await userRes.json();
        console.log('Total Users:', userData.data ? userData.data.length : 'Unknown');
    } else {
        const text = await userRes.text();
        console.log('User Fetch Error:', text);
    }
};

const run = async () => {
    try {
        const token = await login();
        if (token) {
            await fetchProducts(token);
        } else {
            console.log('Login failed, cannot test fetch.');
        }
    } catch (err) {
        console.error('Script Error:', err);
    }
};

run();
