
const root = document.documentElement;
const body = document.body;

const themeToggle = document.getElementById("themeToggle");
const drawerThemeToggle = document.getElementById("drawerThemeToggle");

const menuToggle = document.getElementById("menuToggle");
const drawerClose = document.getElementById("drawerClose");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const mobileDrawer = document.getElementById("mobileDrawer");

// THEME
function setTheme(theme) {
    root.dataset.theme = theme;

    try {
        localStorage.setItem("portfolio-theme", theme);
    } catch (_) {}

    const label = theme === "dark"
        ? "Switch to light theme"
        : "Switch to dark theme";

    [themeToggle, drawerThemeToggle].forEach(button => {
        if (button) {
            button.setAttribute("aria-label", label);
        }
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

function toggleTheme() {
    setTheme(
        root.dataset.theme === "dark" ? "light" : "dark"
    );
}

try {
    const savedTheme = localStorage.getItem("portfolio-theme");

    if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
    }
} catch (_) {}

themeToggle?.addEventListener("click", toggleTheme);
drawerThemeToggle?.addEventListener("click", toggleTheme);

// MOBILE DRAWER
function openDrawer() {
    body.classList.add("drawer-open");
    menuToggle?.setAttribute("aria-expanded", "true");
    mobileDrawer?.setAttribute("aria-hidden", "false");
    drawerClose?.focus();
}

function closeDrawer() {
    body.classList.remove("drawer-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    mobileDrawer?.setAttribute("aria-hidden", "true");
}

menuToggle?.addEventListener("click", openDrawer);
drawerClose?.addEventListener("click", closeDrawer);
drawerBackdrop?.addEventListener("click", closeDrawer);

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeDrawer();
    }
});

document.querySelectorAll(".drawer-nav a").forEach(link => {
    link.addEventListener("click", closeDrawer);
});

// ACTIVE NAVIGATION
const observedSections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(
    ".desktop-nav a, .drawer-nav a"
);

if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            navLinks.forEach(link => {
                const isCurrent =
                    link.getAttribute("href") === `#${entry.target.id}`;

                link.classList.toggle("active", isCurrent);

                if (isCurrent) {
                    link.setAttribute("aria-current", "location");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        });
    }, {
        rootMargin: "-30% 0px -58% 0px",
        threshold: 0
    });

    observedSections.forEach(section => {
        sectionObserver.observe(section);
    });
}

// ESCAPE HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// PORTFOLIO API
async function loadPortfolioData() {
    try {
        const response = await fetch("/api/portfolio");

        if (!response.ok) return;

        const data = await response.json();
        const intro = document.getElementById("heroIntro");

        if (intro && data.intro) {
            intro.textContent = data.intro;
        }

        const skillsGrid = document.getElementById("skillsGrid");

        if (
            skillsGrid &&
            Array.isArray(data.skills) &&
            data.skills.length
        ) {
            skillsGrid.innerHTML = data.skills.map(skill => `
                <article class="skill-card">
                    <span aria-hidden="true">
                        ${escapeHTML(skill.icon || "✦")}
                    </span>
                    <strong>
                        ${escapeHTML(skill.name || "Skill")}
                    </strong>
                </article>
            `).join("");
        }
    } catch (error) {
        console.info(
            "Portfolio API unavailable; using static content."
        );
    }
}

// CONTACT FORM
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

contactForm?.addEventListener("submit", async event => {
    event.preventDefault();

    if (!formStatus) return;

    formStatus.textContent = "Sending...";

    const submitButton = contactForm.querySelector(
        'button[type="submit"]'
    );

    if (submitButton) {
        submitButton.disabled = true;
    }

    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());

    try {
        const response = await fetch("/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            const detail = Array.isArray(result.detail)
                ? result.detail.map(item => item.msg).join(", ")
                : (
                    result.detail ||
                    "Please check your details and try again."
                );

            throw new Error(detail);
        }

        formStatus.textContent = result.note
            ? `${result.message} ${result.note}`
            : result.message;

        if (result.success) {
            contactForm.reset();
        }
    } catch (error) {
        formStatus.textContent =
            error.message ||
            "Could not send the message. Is the FastAPI server running?";
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
});

// INITIALIZE ICONS
function initializeIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

initializeIcons();
loadPortfolioData();
