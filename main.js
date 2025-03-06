import Cropper from 'cropperjs';

const photoInput = document.getElementById('photoInput');
const canvas = document.getElementById('canvas');
const cropButton = document.getElementById('cropButton');
const continueButton = document.getElementById('continueButton');
const sendButton = document.getElementById('sendButton');
const patientIdInput = document.getElementById('patientId');
const patientIdLabel = document.querySelector('label[for="patientId"]');
const startOverButton = document.getElementById('startOverButton');
const takePhotoButton = document.querySelector('.take-photo-button');

const ctx = canvas.getContext('2d');

let cropper;

photoInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Clear the canvas before drawing the new image
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        if (cropper) {
          cropper.destroy();
        }
        cropper = new Cropper(canvas, {
          aspectRatio: 1, // Set default aspect ratio to 1 (square)
          viewMode: 1,
        });
        //Hide send button
        sendButton.style.display = 'none';
        // Show crop and continue buttons
        cropButton.style.display = 'inline-block';
        continueButton.style.display = 'inline-block';

        // Show the canvas
        canvas.style.display = 'block';

        // Hide the take photo button
        takePhotoButton.style.display = 'none';

        // Show the start over button
        startOverButton.style.display = 'inline-block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

cropButton.addEventListener('click', () => {
  if (cropper) {
    const croppedCanvas = cropper.getCroppedCanvas();
    // Clear the canvas before drawing the cropped image
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // *** Resize directly to 300x300 ***
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = 300;
    resizedCanvas.height = 300;
    const resizedContext = resizedCanvas.getContext('2d');
    resizedContext.drawImage(croppedCanvas, 0, 0, 300, 300);

    canvas.width = 300;
    canvas.height = 300;
    ctx.drawImage(resizedCanvas, 0, 0);

    cropper.destroy();
    cropper = null;

    // *** Show send button, patient ID input, and label; hide crop button ***
    sendButton.style.display = 'block';
    patientIdInput.style.display = 'inline-block';
    patientIdLabel.style.display = 'inline-block';
    cropButton.style.display = 'none';
    continueButton.style.display = 'none'; // Also hide continue button
  }
});

continueButton.addEventListener('click', () => {
  const resizedCanvas = document.createElement('canvas');
  resizedCanvas.width = 300;
  resizedCanvas.height = 300;
  const resizedContext = resizedCanvas.getContext('2d');

  resizedContext.drawImage(canvas, 0, 0, 300, 300);

  // Clear the main canvas before drawing the resized image
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.width = 300;
  canvas.height = 300;
  ctx.drawImage(resizedCanvas, 0, 0);

    if (cropper) {
    cropper.destroy();
    cropper = null; // No need to reinitialize Cropper after final resize
  }

  // Show send button and hide continue
  sendButton.style.display = 'block';
  continueButton.style.display = 'none';
  //Hide crop button
  cropButton.style.display = 'none';

  // Show patient ID input and label
  patientIdInput.style.display = 'inline-block';
  patientIdLabel.style.display = 'inline-block';

});

sendButton.addEventListener('click', () => {
  const patientId = patientIdInput.value;

  if (!patientId) {
    alert('Please enter a Patient ID.');
    return;
  }

  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append('image', blob);

    fetch('https://n8n.amcs.tech/webhook-test/picdemo', {
      method: 'POST',
      body: formData,
      headers: {
        'X-Patient-ID': patientId, // Add the Patient ID as a custom header
      },
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
      // Reload the page after successful send
      window.location.reload();
    })
    .catch((error) => {
      console.error('Error:', error);
      alert(`Error sending image: ${error.message}`);
    });
  }, 'image/jpeg');
});

startOverButton.addEventListener('click', () => {
  window.location.reload();
});
