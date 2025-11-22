// Profile Page JavaScript - COMPLETE WORKING VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing profile page');
    checkLoginStatus();
    setupFormHandlers();
    initializeAnimations();
});

function checkLoginStatus() {
    const user = localStorage.getItem('fabricFactoryUser');
    if (user) {
        console.log('User is logged in');
        showLoggedInState(JSON.parse(user));
    } else {
        console.log('No user logged in');
        showLoggedOutState();
    }
}

function showLoggedInState(user) {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userWelcome').style.display = 'block';
    document.getElementById('userName').textContent = user.fullName || user.email;
    document.getElementById('welcomeTitle').textContent = `Welcome Back, ${user.fullName || user.email}!`;
    document.getElementById('welcomeText').textContent = 'Continue your fabric shopping journey with exclusive member benefits';
}

function showLoggedOutState() {
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userWelcome').style.display = 'none';
    document.getElementById('welcomeTitle').textContent = 'Welcome to Your Creative Space';
    document.getElementById('welcomeText').textContent = 'Join our community of fabric enthusiasts and unlock exclusive benefits';
}

function setupFormHandlers() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (validateLogin(email, password)) {
            processLogin(email);
        } else {
            showFormError('loginForm', 'Please enter a valid email and password (at least 6 characters).');
        }
    });

    // Signup form
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = {
            fullName: document.getElementById('signupFullName').value,
            dateOfBirth: document.getElementById('signupDob').value,
            username: document.getElementById('signupUsername').value,
            email: document.getElementById('signupEmail').value,
            password: document.getElementById('signupPassword').value,
            confirmPassword: document.getElementById('signupConfirmPassword').value,
            agreeTerms: document.getElementById('agreeTerms').checked
        };

        if (formData.password !== formData.confirmPassword) {
            showFormError('signupForm', 'Passwords do not match.');
            return;
        }

        if (!formData.agreeTerms) {
            showFormError('signupForm', 'You must agree to the Terms of Service and Privacy Policy.');
            return;
        }

        if (validateSignup(formData)) {
            processSignup(formData);
        } else {
            showFormError('signupForm', 'Please fill in all fields correctly.');
        }
    });
}

function validateLogin(email, password) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && password.length >= 6;
}

function validateSignup(formData) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(formData.email) && 
           formData.password.length >= 6 && 
           formData.username.length >= 3 && 
           formData.fullName.length >= 2 &&
           formData.dateOfBirth;
}

function processLogin(email) {
    showLoading();
    
    setTimeout(() => {
        const user = {
            email: email,
            fullName: email.split('@')[0],
            loginTime: new Date().toISOString(),
            sessionId: 'ff_' + Date.now()
        };
        
        localStorage.setItem('fabricFactoryUser', JSON.stringify(user));
        showNotification('Login successful! Redirecting to products...', 'success');
        
        setTimeout(() => {
            window.location.href = 'product.html';
        }, 2000);
    }, 1500);
}

function processSignup(formData) {
    showLoading();
    
    setTimeout(() => {
        const user = {
            email: formData.email,
            username: formData.username,
            fullName: formData.fullName,
            dateOfBirth: formData.dateOfBirth,
            joinDate: new Date().toISOString(),
            sessionId: 'ff_' + Date.now()
        };
        
        localStorage.setItem('fabricFactoryUser', JSON.stringify(user));
        showNotification(`Welcome to Fabric Factory, ${user.fullName}! Redirecting to products...`, 'success');
        
        setTimeout(() => {
            window.location.href = 'product.html';
        }, 2000);
    }, 2000);
}

function goToProducts() {
    window.location.href = 'product.html';
}

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('fabricFactoryUser');
        showNotification('You have been logged out successfully', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
}

function showFormError(formId, message) {
    const form = document.getElementById(formId);
    const existingError = form.querySelector('.form-error');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;
    form.insertBefore(errorDiv, form.firstChild);

    setTimeout(() => {
        if (errorDiv.parentNode) errorDiv.parentNode.removeChild(errorDiv);
    }, 5000);
}

function showNotification(message, type = 'success') {
    const existingNotifs = document.querySelectorAll('.notification');
    existingNotifs.forEach(notif => notif.remove());

    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    document.body.appendChild(notif);

    setTimeout(() => notif.style.transform = 'translateX(0)', 100);
    setTimeout(() => {
        notif.style.transform = 'translateX(400px)';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

function showLogin() {
    document.getElementById("loginModal").style.display = "flex";
    document.body.style.overflow = "hidden";
}

function showSignup() {
    document.getElementById("signupModal").style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeModals() {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("signupModal").style.display = "none";
    document.body.style.overflow = "auto";
}

function showLoading() {
    closeModals();
    document.getElementById("loadingScreen").style.display = "flex";
}

function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const benefitCards = document.querySelectorAll('.benefit-card');
    benefitCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });

    const welcomeContent = document.querySelector('.welcome-content');
    const welcomeImage = document.querySelector('.welcome-image');
    
    if (welcomeContent) {
        welcomeContent.style.opacity = '0';
        welcomeContent.style.transform = 'translateX(-50px)';
        setTimeout(() => {
            welcomeContent.style.opacity = '1';
            welcomeContent.style.transform = 'translateX(0)';
        }, 300);
    }
    
    if (welcomeImage) {
        welcomeImage.style.opacity = '0';
        welcomeImage.style.transform = 'translateX(50px)';
        setTimeout(() => {
            welcomeImage.style.opacity = '1';
            welcomeImage.style.transform = 'translateX(0)';
        }, 500);
    }
}

document.addEventListener('click', function(e) {
    if (e.target === document.getElementById('loginModal') || e.target === document.getElementById('signupModal')) {
        closeModals();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModals();
});