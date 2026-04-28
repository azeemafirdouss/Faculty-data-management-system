const fs = require('fs');
const files = ['REGISTERPAGE.html', 'ABOUTUS.html', 'GRIEVANCE.html'];

const replacement = `<ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="btn btn-success login-btn" href="HOMEPAGE.html">Homepage</a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-success login-btn" href="REGISTERPAGE.html">Register</a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-success login-btn" href="LOGIN.html">Login</a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-success login-btn" href="ABOUTUS.html">About Us</a>
                    </li>
                </ul>`;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    const regex = /<ul class="navbar-nav">[\s\S]*?<\/ul>/;
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Fixed', file);
});
