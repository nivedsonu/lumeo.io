// 6 Core Engineering Departments Data
const departmentsData = [
    { id: 'cse', name: 'CSE', full: 'Computer Science', icon: 'ph-desktop', color: '#E8F2FF', iconColor: '#007AFF' },
    { id: 'eee', name: 'EEE', full: 'Electrical', icon: 'ph-lightning', color: '#FFF0ED', iconColor: '#FF3B30' },
    { id: 'ece', name: 'ECE', full: 'Electronics', icon: 'ph-cpu', color: '#F3E5F5', iconColor: '#9C27B0' },
    { id: 'me', name: 'ME', full: 'Mechanical', icon: 'ph-gear', color: '#EAF8ED', iconColor: '#34C759' },
    { id: 'ce', name: 'CE', full: 'Civil', icon: 'ph-buildings', color: '#FFF8E1', iconColor: '#FF9800' },
    { id: 'it', name: 'IT', full: 'Information Tech', icon: 'ph-globe', color: '#E0F7FA', iconColor: '#00BCD4' }
];

// Semester Theme Colors for subtle variation
const semesterThemes = {
    1: '#007AFF', 2: '#FF3B30', 3: '#34C759', 4: '#9C27B0',
    5: '#FF9800', 6: '#00BCD4', 7: '#E91E63', 8: '#607D8B'
};

// DOM Elements
const dockItems = document.querySelectorAll('.dock-item');
const deptGrid = document.getElementById('dept-grid');
const semesterTitle = document.getElementById('semester-title');

// Auth DOM Elements
const loginAction = document.getElementById('login-action');
const profileAction = document.getElementById('profile-action');
const profilePic = document.getElementById('profile-pic');
const profileDropdown = document.getElementById('profile-dropdown');
const logoutBtn = document.getElementById('logout-btn');

// Scroll Animation Elements
const heroContent = document.querySelector('.hero-content');
const appDashboard = document.getElementById('app-dashboard');
const dockContainer = document.getElementById('dock-container');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();

    // Automatically load S1 but don't animate down yet
    if (deptGrid && dockItems.length > 0) {
        loadSemester(1);
    }

    // Intersection Observer for Scroll Reveals
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(el => observer.observe(el));

    // Add click listeners to dock items
    dockItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const semester = e.target.getAttribute('data-semester');

            // Handle Active States
            dockItems.forEach(di => di.classList.remove('active'));
            e.target.classList.add('active');

            // Add subtle haptic feedback feeling if possible via CSS animation
            e.target.style.transform = 'scale(0.95) translateY(-2px)';
            setTimeout(() => {
                e.target.style.transform = '';
            }, 100);

            // Fetch and render data
            animateContentTransition(() => {
                loadSemester(semester);
            });
        });
    });

    // Profile Dropdown Toggle
    if (profilePic) {
        profilePic.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (profileDropdown && profileDropdown.classList.contains('show') && !profileAction.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }
    });

    // Handle Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('loggedIn'); // Clear legacy state
        localStorage.removeItem('username'); // Clear legacy state
        profileDropdown.classList.remove('show');
        checkAuthState(); // Update UI
        window.location.href = 'login.html'; // Redirect to login page
    });
});

// Scroll handling logic
function handleScroll() {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;

    // Calculate scroll progress relative to viewport height (0 to 1)
    const scrollProgress = Math.min(1, scrollY / (windowH * 0.8));

    // 1. Background Effect (gradual dimming/blur based on scroll)
    const bgOpacity = 0.6 - (scrollProgress * 0.3); // Dim blobs slightly
    document.querySelectorAll('.blob').forEach(blob => {
        blob.style.opacity = bgOpacity;
    });

    // 2. Reveal Dock
    // Show dock only when the department grid enters the viewport (past the greeting and title)
    let isPastGreeting = false;
    if (deptGrid) {
        const gridTop = deptGrid.getBoundingClientRect().top;
        // Trigger dock appearance when dept-grid is sufficiently in view
        isPastGreeting = gridTop < (windowH * 0.85);
    } else {
        isPastGreeting = scrollY > (windowH * 0.5);
    }

    if (dockContainer) {
        if (isPastGreeting) {
            dockContainer.classList.remove('hidden');
        } else {
            dockContainer.classList.add('hidden');
        }
    }
}

// Add Scroll Listener Back
window.addEventListener('scroll', handleScroll);
handleScroll(); // Trigger once on load

// Authentication and Dynamic Header State Management
function checkAuthState() {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    let storedName = localStorage.getItem('username');

    // Default fallback name
    if (!storedName || storedName.trim() === '') {
        storedName = 'User';
    }

    if (isLoggedIn) {
        // Show Profile, Hide Login Icon
        loginAction.style.display = 'none';
        profileAction.style.display = 'block';
    } else {
        // Show Login Icon, Hide Profile
        loginAction.style.display = 'flex';
        profileAction.style.display = 'none';

        // Ensure "Guest" isn't stored, but default to User
        storedName = 'User';
    }

    updateDashboardHeader(storedName);
}

// Update the Date and Greeting Dynamically
function updateDashboardHeader(userName) {
    // 1. Update Date (e.g., MONDAY, MARCH 6)
    const dateEl = document.querySelector('.date');
    if (dateEl) {
        const now = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        // 'en-US' guarantees the requested format structure, converted to uppercase
        dateEl.textContent = now.toLocaleDateString('en-US', options).toUpperCase();
    }

    // 2. Update Greeting Sequence
    const greetingEl = document.querySelector('.greeting');
    if (greetingEl) {
        const currentHour = new Date().getHours();
        let timeGreeting = 'Good Morning';

        if (currentHour >= 5 && currentHour < 12) {
            timeGreeting = 'Good Morning';
        } else if (currentHour >= 12 && currentHour < 18) {
            timeGreeting = 'Good Afternoon';
        } else if (currentHour >= 18 && currentHour < 22) {
            timeGreeting = 'Good Evening';
        } else {
            timeGreeting = 'Good Night';
        }

        // Retrieve only the first name for casual greeting
        const firstName = userName.split(' ')[0];
        greetingEl.textContent = `${timeGreeting}, ${firstName}.`;
    }
}

function loadSemester(semester) {
    semesterTitle.innerHTML = `Semester ${semester}`;
    semesterTitle.style.color = semesterThemes[semester] || 'var(--text-main)';

    deptGrid.innerHTML = ''; // Clear current

    // Render the 6 departments identically for every semester
    departmentsData.forEach((dept) => {
        // Determine if this is a CSE card and the semester is 3-8
        const isCse = dept.id === 'cse';
        const semNum = parseInt(semester);
        const hasSpecificPage = isCse && semNum >= 3 && semNum <= 8;

        let cardInner = `
            <div class="dept-icon" style="background: ${dept.color}; color: ${dept.iconColor};">
                <i class="ph ${dept.icon}"></i>
            </div>
            <div class="dept-info">
                <h3>${dept.name}</h3>
            </div>
        `;

        if (hasSpecificPage) {
            // Wrap the card in an anchor tag pointing to the specific semester page
            const anchor = document.createElement('a');
            anchor.href = `cses${semester}.html`;
            anchor.className = 'glass-card dept-card';
            anchor.style.textDecoration = 'none'; // Ensure no underline
            anchor.innerHTML = cardInner;
            deptGrid.appendChild(anchor);
        } else {
            // Default non-clickable card
            const card = document.createElement('div');
            card.className = 'glass-card dept-card';
            card.innerHTML = cardInner;
            deptGrid.appendChild(card);
        }
    });
}

function animateContentTransition(updateContent) {
    deptGrid.style.opacity = '0';
    deptGrid.style.transform = 'translateY(10px) scale(0.98)';
    semesterTitle.style.opacity = '0';

    setTimeout(() => {
        updateContent();

        // Trigger reflow
        void deptGrid.offsetWidth;

        deptGrid.style.opacity = '1';
        deptGrid.style.transform = 'translateY(0) scale(1)';
        semesterTitle.style.opacity = '1';
        semesterTitle.style.transition = 'opacity 0.3s ease, color 0.4s ease';
    }, 250); // Wait for fade out
}
