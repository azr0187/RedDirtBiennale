// A simple message to show the script is loaded
console.log("Website successfully loaded! Hello from script.js!");

// Wait for the HTML document to fully load before running the interaction
document.addEventListener("DOMContentLoaded", function() {
    
    // Find the contact link by its ID
    const contactLink = document.getElementById("contact-link");
    
    // Add a click event to it
    if(contactLink) {
        contactLink.addEventListener("click", function() {
            alert("Thanks for reaching out! Your default email client will now open.");
        });
    }
});