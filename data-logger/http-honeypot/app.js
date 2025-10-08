const express = require('express');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        ip: req.ip,
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body
    }));
    next();
});

app.get('/', (req, res) => {
    res.send('<html><body>Router Admin Panel</body></html>');
});

app.listen(8080, '0.0.0.0', () => {
    console.log('HTTP honeypot running on port 8080');
});
