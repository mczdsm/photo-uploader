import Cropper from 'cropperjs';

const photoInput = document.getElementById('photoInput');
const canvas = document.getElementById('canvas');
const cropButton = document.getElementById('cropButton');
const continueButton = document.getElementById('continueButton'); // Renamed sendButton
const patientIdInput = document.getElementById('patientId');
const startOverButton = document.getElementById('startOverButton');
const takePhotoButton = document.querySelector('.take-photo-button');
const titleElement = document.querySelector('h1'); // Get the title element
const dobDisplay = document.getElementById('dobDisplay');
const confirmAndSendButton = document.getElementById('confirmAndSendButton'); // New button

const ctx = canvas.getContext('2d');

let cropper;
let patientDOB = ''; // Variable to store the patient's DOB

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
        continueButton.style.display = 'none';
        // Show crop button
        cropButton.style.display = 'inline-block';

        // Show the canvas
        canvas.style.display = 'block';

        // Hide the take photo button
        takePhotoButton.style.display = 'none';

        // Show the start over button
        startOverButton.style.display = 'inline-block';

        // Hide the title
        titleElement.style.display = 'none';
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

    // *** Show patient ID input and continue button; hide crop button ***
    patientIdInput.style.display = 'inline-block';
    continueButton.style.display = 'block';
    cropButton.style.display = 'none';
  }
});

continueButton.addEventListener('click', () => {
    const patientId = patientIdInput.value;

    if (!patientId) {
        alert('Please enter a Patient ID.');
        return;
    }

    // *** Fetch DOB from the new n8n webhook ***
    fetch('https://n8n.amcs.tech/webhook-test/dob-verification', { // Replace with your actual webhook URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Patient-ID': patientId, // Send Patient ID in the header
        },
        body: JSON.stringify({ patientId: patientId }) // Send Patient ID in the body (optional, depends on your webhook)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        return response.json(); // Expecting JSON response
    })
    .then(data => {
        patientDOB = data.patientDOB; // Store the DOB, assuming the response has a 'dob' field
        if (!patientDOB) {
          throw new Error('DOB not found in response');
        }
        dobDisplay.textContent = `Patient DOB: ${patientDOB}`;
        dobDisplay.style.display = 'block';
        confirmAndSendButton.style.display = 'block';

        // Hide input and continue button
        patientIdInput.style.display = 'none';
        continueButton.style.display = 'none';
    })
    .catch((error) => {
        console.error('Error:', error);
        alert(`Error fetching DOB: ${error.message}`);
    });
});

confirmAndSendButton.addEventListener('click', () => {
  const patientId = patientIdInput.value; // Get Patient ID again

  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append('image', blob);
    formData.append('dob', patientDOB); // Include DOB in the form data

    fetch('https://n8n.amcs.tech/webhook-test/picdemo', {
      method: 'POST',
      body: formData,
      headers: {
        'X-Patient-ID': patientId, // Keep sending Patient ID as a header
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
      alert('Image and DOB sent successfully!');
      // Reload the page after successful send
      window.location.reload();
    })
    .catch((error) => {
      console.error('Error:', error);
      alert(`Error sending image and DOB: ${error.message}`);
    });
  }, 'image/jpeg');
});

startOverButton.addEventListener('click', () => {
  window.location.reload();
});
