const fs = require('fs');

const files = [
    { name: 'HOME.html', active: 'HOME.html' },
    { name: 'REGISTERPAGE.html', active: 'REGISTERPAGE.html' },
    { name: 'LOGIN.html', active: 'LOGIN.html' },
    { name: 'ABOUTUS.html', active: 'ABOUTUS.html' },
    { name: 'GRIEVANCE.html', active: 'GRIEVANCE.html' }
];

files.forEach(fileObj => {
    try {
        let content = fs.readFileSync(fileObj.name, 'utf-8');
        
        // Let's first clean up the literal ${...} that was accidentally injected
        const brokenRegex = /<ul class="navbar-nav">[\s\S]*?<\/ul>/;

        const replacement = `<ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="btn btn-success login-btn ${fileObj.active === 'HOME.html' ? 'active-nav' : ''}" href="HOME.html">Homepage</a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-success login-btn ${fileObj.active === 'REGISTERPAGE.html' ? 'active-nav' : ''}" href="REGISTERPAGE.html">Register</a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-success login-btn ${fileObj.active === 'LOGIN.html' ? 'active-nav' : ''}" href="LOGIN.html">Login</a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-success login-btn ${fileObj.active === 'ABOUTUS.html' ? 'active-nav' : ''}" href="ABOUTUS.html">About Us</a>
                    </li>
                </ul>`;

        content = content.replace(brokenRegex, replacement);
        
        fs.writeFileSync(fileObj.name, content, 'utf-8');
        console.log('Fixed', fileObj.name);
    } catch (e) {
        console.error('Error fixing', fileObj.name, e);
    }
});
