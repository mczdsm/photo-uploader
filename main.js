import Cropper from 'cropperjs';
import config from './config.json';

const photoInput = document.getElementById('photoInput');
const canvas = document.getElementById('canvas');
const cropButton = document.getElementById('cropButton');
const continueButton = document.getElementById('continueButton');
const patientIdInput = document.getElementById('patientId');
const startOverButtons = document.querySelectorAll('.start-over-button'); // Select all elements with this class
const takePhotoButton = document.querySelector('.take-photo-button');
const titleElement = document.querySelector('h1');
const dobDisplay = document.getElementById('dobDisplay');
const confirmAndSendButton = document.getElementById('confirmAndSendButton');
const patientInfoDiv = document.getElementById('patientInfo');
const confirmationContainer = document.getElementById('confirmationContainer');

const ctx = canvas.getContext('2d');

let cropper;
let patientDOB = '';

// Function to reset the application state
const resetApplication = () => {
  window.location.reload();
};

// Add event listeners to all start over buttons
startOverButtons.forEach(button => {
  button.addEventListener('click', resetApplication);
});

photoInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        if (cropper) {
          cropper.destroy();
        }
        cropper = new Cropper(canvas, {
          aspectRatio: 300 / 250,
          viewMode: 1,
        });
        cropButton.classList.add('show');
        canvas.classList.add('show');
        takePhotoButton.classList.add('hide');
        startOverButtons.forEach(button => button.classList.add('show'));
        titleElement.classList.add('hide');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

cropButton.addEventListener('click', () => {
  if (cropper) {
    const croppedCanvas = cropper.getCroppedCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = 300;
    resizedCanvas.height = 250;
    const resizedContext = resizedCanvas.getContext('2d');
    resizedContext.drawImage(croppedCanvas, 0, 0, 300, 250);

    canvas.width = 300;
    canvas.height = 250;
    ctx.drawImage(resizedCanvas, 0, 0);

    cropper.destroy();
    cropper = null;

    // Show patient info section after cropping
    patientInfoDiv.classList.add('show');
    cropButton.classList.remove('show');
  }
});

continueButton.addEventListener('click', () => {
    const patientId = patientIdInput.value;

    if (!patientId) {
        alert('Please enter a Patient ID.');
        return;
    }

    fetch(config.apiEndpoints.dobVerification, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Patient-ID': patientId,
        },
        body: JSON.stringify({ patientId: patientId })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        patientDOB = data.patientDOB;
        const lastName = data.last;
        if (!patientDOB || !lastName) {
          throw new Error('DOB or last name not found in response');
        }

        // Display DOB and last name on separate lines
        dobDisplay.innerHTML = `Patient DOB: ${patientDOB}<br>Last Name: ${lastName}`;
        dobDisplay.classList.add('show');
        confirmAndSendButton.classList.add('show');

        patientInfoDiv.classList.remove('show'); // Hide patient info section
        confirmationContainer.classList.add('show');

    })
    .catch((error) => {
        console.error('Error:', error);
        alert(`Error fetching DOB: ${error.message}`);
    });
});

confirmAndSendButton.addEventListener('click', () => {
  const patientId = patientIdInput.value;

  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append('image', blob);
    formData.append('dob', patientDOB);

    fetch(config.apiEndpoints.picDemo, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Patient-ID': patientId,
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
      window.location.reload();
    })
    .catch((error) => {
      console.error('Error:', error);
      alert(`Error sending image and DOB: ${error.message}`);
    });
  }, 'image/jpeg');
});
