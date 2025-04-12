document.addEventListener('DOMContentLoaded', function() {
    const resumeBtn = document.getElementById('resumeBtn');
    const resumeModal = document.getElementById('resumeModal');
    const resumeContent = document.getElementById('resumeContent');
    const closeResumeBtn = document.getElementById('closeResumeBtn');

    function openResume() {
        // Open resume in new tab
        window.open('assets/resume.pdf', '_blank');
    }

    resumeBtn.addEventListener('click', openResume);
});