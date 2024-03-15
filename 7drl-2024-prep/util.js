//@ts-check

import { SpriteSheet } from "../eskv/lib/modules/sprites.js";

export function loadUserImage(destinationImage) {
    // Create the file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none'; // Hide the input

    // Append the file input to the body temporarily
    document.body.appendChild(fileInput);
    
    fileInput.addEventListener('change', function(e) {
        // Handle the file input change, e.g., load and display the selected image
        if(!fileInput.files) return;
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                destinationImage.src = reader.result;
            };
            reader.readAsDataURL(file);
        }

        // Clean up: remove the input element after use
        document.body.removeChild(fileInput);
    });

    // Programmatically open the file dialog
    fileInput.click();
}

/**
 * 
 * @param {string} name
 * @param {SpriteSheet} spriteSheet
 */
export function saveSpriteSheetToLocalStorage(name, spriteSheet) {    
    // Convert the canvas to a data URL (Base64 string)
    const canvas = document.createElement("canvas");
    canvas.width = spriteSheet.sheet.width;
    canvas.height = spriteSheet.sheet.height;
    const ctx = canvas.getContext("2d");
    if(!ctx) return;
    ctx.drawImage(spriteSheet.sheet, 0, 0);
    const imageDataUrl = canvas.toDataURL('image/png'); // You can use 'image/jpeg' or other formats    
    // Save the data URL to local storage
    localStorage.setItem(`TileMapper/Images/${name}`, imageDataUrl);
    localStorage.setItem(`TileMapper/ImageSpriteSizes/${name}`, JSON.stringify(spriteSheet.spriteSize));
}

/**
 * @param {string} name
 * @param {SpriteSheet} spriteSheet
 */
export function loadImageFromLocalStorage(name, spriteSheet) {
    // Retrieve the data URL from local storage
    const imageDataUrl = localStorage.getItem(`TileMapper/Images/${name}`);
    
    if (imageDataUrl) {
      spriteSheet.sheet.src = imageDataUrl;
    }
    spriteSheet.spriteSize = JSON.parse(localStorage.getItem(`TileMapper/ImageSizes/${name}`)??'16');
}

