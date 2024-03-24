//@ts-check
import { QDrawing } from './drawing.js';
import { QDraw } from './app.js';

export class QDataStore {
    /**
     * Initializes the specified database
     * @param {string} dbName 
     */
    constructor(dbName) {
        this.dbName = dbName;
        this.db = null;
    }
    // Opens or initializes the database -- TODO: Make this a static constructor?
    async open() {
        if (this.db) {
            return;
        }

        this.db = await new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event) => {
                if(event.target===null) {
                    reject(Error('Unknown IndexedDB connection error'));
                    return;
                } 
                const db = /**@type {IDBRequest} */ (event.target).result;

                // Create object stores
                db.createObjectStore("Drawings", { keyPath: "id" });
                db.createObjectStore("Images", { keyPath: "id" });
                db.createObjectStore("Palettes", { keyPath: "id" });
                db.createObjectStore("Gradients", { keyPath: "id" });
                db.createObjectStore("Fonts", { keyPath: "id" });
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(/**@type {IDBRequest}*/(event.target).error);
        });

    }

    /**
     * Adding a drawing to the store -- TODO: what if it exists already?
     * @param {string} id 
     * @param {QDrawing} drawing 
     */
    async addDrawing(id, drawing) {
        const transaction = this.db.transaction("Drawings", "readwrite");
        const store = transaction.objectStore("Drawings");
        await store.add({ id, drawing: drawing.serialize() });
    }
    /**
     * Fetch a drawing from the store
     * @param {string} id 
     * @returns {Promise<object|null>}
     */
    async getDrawing(id) {
        const transaction = this.db.transaction("Drawings", "readonly");
        const store = transaction.objectStore("Drawings");
        const record = await store.get(id);
        return record ? record.drawing : null;
    }
    /**
     * Remove a drawing from the store
     * @param {string} id 
     */
    async removeDrawing(id) {
        const transaction = this.db.transaction("Drawings", "readwrite");
        const store = transaction.objectStore("Drawings");
        await store.delete(id);
    }

    // List IDs in a given store
    /**
     * Get the list of IDs from a given store
     * @param {'Drawings'|'Images'|'Fonts'|'Gradients'} storeName 
     * @returns 
     */
    async listIds(storeName) {
        const transaction = this.db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const ids = [];

        // Cursor to iterate over all records in the store
        return new Promise((resolve, reject) => {
            store.openCursor().onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    ids.push(cursor.key);
                    cursor.continue();
                } else {
                    resolve(ids);
                }
            };
            store.openCursor().onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    // Add an image
    async addImage(id, image) {
        const blob = await this.imageToBlob(image);
        const transaction = this.db.transaction("Images", "readwrite");
        const store = transaction.objectStore("Images");
        await store.put({ id, image: blob });
    }

    // Convert an Image object to a Blob
    imageToBlob(image) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext('2d');
            if(context) {
                context.drawImage(image, 0, 0);
                canvas.toBlob(blob => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Blob creation failed"));
                    }
                }, 'image/png'); // You can adjust the format if needed    
            }
        });
    }

    // Get an image
    async getImage(id) {
        const transaction = this.db.transaction("Images", "readonly");
        const store = transaction.objectStore("Images");
        const record = await store.get(id);
        if (record && record.image) {
            return this.createImageFromBlob(record.image);
        }
        return null;
    }

    // Create an Image object from a Blob
    createImageFromBlob(blob) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            img.onerror = reject;
            img.src = url;
        });
    }
    /**
     * Removes image blob from the store
     * @param {string} id 
     */
    async removeImage(id) {
        const transaction = this.db.transaction("Images", "readwrite");
        const store = transaction.objectStore("Images");
        await store.delete(id);
    }

    // Add a font
    async addFont(id, fontBlob) {
        const transaction = this.db.transaction("Fonts", "readwrite");
        const store = transaction.objectStore("Fonts");
        await store.put({ id, font: fontBlob });
    }

    // Get and register a font
    async getFont(id) {
        const transaction = this.db.transaction("Fonts", "readonly");
        const store = transaction.objectStore("Fonts");
        const record = await store.get(id);
        if (record && record.font) {
            const fontFace = await this.registerFontBlob(record.font, id);
            return fontFace;
        }
        return null;
    }

    // Register a font from a Blob
    async registerFontBlob(blob, fontFamily) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(blob);
            const fontFace = new FontFace(fontFamily, `url(${url})`);
            fontFace.load().then(loadedFace => {
                document.fonts.add(loadedFace);
                URL.revokeObjectURL(url);
                resolve(loadedFace);
            }).catch(reject);
        });
    }

    // Remove a font
    async removeFont(id) {
        const transaction = this.db.transaction("Fonts", "readwrite");
        const store = transaction.objectStore("Fonts");
        await store.delete(id);
    }
    /**
     * Function to programmatically open the file picker and let the user pick a local file
     * which will then be added to the Images store
     */
    pickLocalImage() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/png, image/jpeg'; // Specify the file types you want

        fileInput.addEventListener('change', event=>{
            if(!event.target) return;
            const files = fileInput.files;//.value;
            if(!files) return;
            const file = files[0]; // Get the first file (if multiple files are allowed, this would need to be handled)

            // Check if the file is an image.
            if (file && file.type.match('image.*')) {
                // Read the file into memory as a Blob
                const reader = new FileReader();
                reader.onload = (e)=>{
                    if(e.target) {
                        const imageDataURL = e.target.result;
                        this.addImage(imageDataURL); // Use the function from the previous examples    
                    }
                };
                reader.readAsDataURL(file); // Or readAsArrayBuffer(file) if you prefer
                document.removeChild(fileInput);
            } else {
                console.error('File is not an image.');
                document.removeChild(fileInput);
            }
        });
        fileInput.click();
    }
    /**
     * Adds a gradient to the gradients store
     * @param {string} id 
     * @param {Array<[string, number]>} gradientStops 
     */
    async addGradient(id, gradientStops) {
        const transaction = this.db.transaction("Gradients", "readwrite");
        const store = transaction.objectStore("Gradients");
        await store.put({ id, stops: gradientStops });
    }
    /**
     * Retrieves a gradient from the gradients store
     * @param {string} id 
     * @returns {Promise<Array<[string, number]>|null>};
     */
    async getGradient(id) {
        const transaction = this.db.transaction("Gradients", "readonly");
        const store = transaction.objectStore("Gradients");
        const record = await store.get(id);
        return record ? record.stops : null;
    }
    /**
     *  Remove a gradient from the gradients store 
     * @param {string} id 
     */
    async removeGradient(id) {
        const transaction = this.db.transaction("Gradients", "readwrite");
        const store = transaction.objectStore("Gradients");
        await store.delete(id);
    }    
}
