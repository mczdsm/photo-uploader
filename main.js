import Cropper from 'cropperjs';

const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const cropButton = document.getElementById('cropButton');
const resizeButton = document.getElementById('resizeButton');
const sendButton = document.getElementById('sendButton');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const ctx = canvas.getContext('2d');

let cropper;

imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        if (cropper) {
          cropper.destroy();
        }
        cropper = new Cropper(canvas, {
          aspectRatio: NaN, // Free aspect ratio by default
          viewMode: 1,     // Allow image to be smaller than the container
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

cropButton.addEventListener('click', () => {
    if (cropper) {
        const croppedCanvas = cropper.getCroppedCanvas();
        canvas.width = croppedCanvas.width;
        canvas.height = croppedCanvas.height;
        ctx.drawImage(croppedCanvas, 0, 0);
        cropper.destroy();  // Destroy the cropper after cropping.
        cropper = new Cropper(canvas, {  //reinitialize
            aspectRatio: NaN,
            viewMode: 1,
        });
    }
});

resizeButton.addEventListener('click', () => {
  const width = parseInt(widthInput.value, 10);
  const height = parseInt(heightInput.value, 10);

  if (isNaN(width) || isNaN(height)) {
    alert('Please enter valid width and height.');
    return;
  }

    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = width;
    resizedCanvas.height = height;
    const resizedContext = resizedCanvas.getContext('2d');

    resizedContext.drawImage(canvas, 0, 0, width, height);

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(resizedCanvas, 0, 0);

    if (cropper) {
        cropper.destroy();
        cropper = new Cropper(canvas, {
            aspectRatio: NaN,
            viewMode: 1
        });
    }
});

sendButton.addEventListener('click', () => {
  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append('image', blob);

    fetch('https://n8n.amcs.tech/webhook-test/picdemo', {
      method: 'POST',
      body: formData,
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
      console.log('Success:', data);
      alert('Image sent successfully!');
    })
    .catch((error) => {
      console.error('Error:', error);
      alert(`Error sending image: ${error.message}`);
    });
  }, 'image/jpeg'); // Specify MIME type here
});
