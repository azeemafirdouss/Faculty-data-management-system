const fs = require('fs');

const files = [
    'HOME.html',
    'REGISTERPAGE.html',
    'LOGIN.html',
    'ABOUTUS.html',
    'GRIEVANCE.html'
];

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf-8');
        
        // 1. Add navbar-dark to make the toggler icon white
        content = content.replace('<nav class="navbar navbar-expand-lg">', '<nav class="navbar navbar-expand-lg navbar-dark">');
        content = content.replace('<nav class="navbar navbar-expand-lg mb-5">', '<nav class="navbar navbar-expand-lg navbar-dark mb-5">');
        
        // 2. Add the toggler button and the ID to the collapse div
        const searchString = `<a class="navbar-brand" href="HOME.html">FaculTech👨‍🎓</a>
            <div class="collapse navbar-collapse justify-content-end">`;
            
        const replacementString = `<a class="navbar-brand" href="HOME.html">FaculTech👨‍🎓</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse justify-content-end" id="navbarNav">`;

        // Wait, GRIEVANCE.html might have different indentation. Let's use a regex.
        const regex = /<a class="navbar-brand" href="HOME\.html">FaculTech👨‍🎓<\/a>\s*<div class="collapse navbar-collapse justify-content-end">/g;
        
        const newReplacement = `<a class="navbar-brand" href="HOME.html">FaculTech👨‍🎓</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse justify-content-end" id="navbarNav">`;

        content = content.replace(regex, newReplacement);
        
        // Also fix HOME.html manually if the user manually modified it to not have the emoji, etc.
        // Actually, the user screenshot shows "FaculTech 👨‍🎓" so it probably still has it.
        
        fs.writeFileSync(file, content, 'utf-8');
        console.log('Fixed mobile nav for', file);
    } catch (e) {
        console.error('Error fixing', file, e);
    }
});
