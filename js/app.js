
/* =====================================
   VIDEO STUDIO
   Main Application Controller
===================================== */

"use strict";

const VideoStudio = {

    version: "1.0.0",

    appName: "VIDEO STUDIO",

    initialized: false,

    elements: {},

    // Initialize application
    init() {

        if (this.initialized) return;

        this.cacheElements();

        this.bindEvents();

        this.initialized = true;

        console.log(
            `${this.appName} v${this.version} initialized successfully`
        );

    },

    // Cache HTML elements
    cacheElements() {

        this.elements = {
            createProjectButton: document.querySelector(
                ".create-project-button"
            ),

            projectsContainer: document.querySelector(
                "#projects-container"
            ),

            settingsButton: document.querySelector(
                ".settings-button"
            )
        };

    },

    // Register application events
    bindEvents() {

        const createButton = this.elements.createProjectButton;

        if (createButton) {

            createButton.addEventListener("click", () => {
                this.createProject();
            });

        }

        const settingsButton = this.elements.settingsButton;

        if (settingsButton) {

            settingsButton.addEventListener("click", () => {
                this.openSettings();
            });

        }

    },

    // Create a new editing project
    createProject() {

    console.log("Opening video editor");

    window.location.href = "editor.html";

},
    // Open application settings
    openSettings() {

        console.log("Settings requested");

        alert("إعدادات VIDEO STUDIO ستتوفر قريباً");

    }

};

// Start application after page loading
document.addEventListener("DOMContentLoaded", () => {

    VideoStudio.init();

});

// Make application available to other modules
window.VideoStudio = VideoStudio;
