import Cropper from 'cropperjs';

const photoInput = document.getElementById('photoInput');
const canvas = document.getElementById('canvas');
const cropButton = document.getElementById('cropButton');
const continueButton = document.getElementById('continueButton');
const patientIdInput = document.getElementById('patientId');
const startOverButton = document.getElementById('startOverButton');
const takePhotoButton = document.querySelector('.take-photo-button');
const titleElement = document.querySelector('h1');
const dobDisplay = document.getElementById('dobDisplay');
const confirmAndSendButton = document.getElementById('confirmAndSendButton');

const ctx = canvas.getContext('2d');

let cropper;
let patientDOB = '';

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
          aspectRatio: 1,
          viewMode: 1,
        });
        cropButton.style.display = 'inline-block';
        canvas.style.display = 'block';
        takePhotoButton.style.display = 'none';
        startOverButton.style.display = 'inline-block';
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    // Show elements after cropping
    document.querySelector('label[for="patientId"]').style.display = 'inline-block';
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

    fetch('https://n8n.amcs.tech/webhook/dob-verification', {
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
        const lastName = data.last; // Get the last name
        if (!patientDOB || !lastName) {
          throw new Error('DOB or last name not found in response');
        }

        // Display DOB and last name on separate lines
        dobDisplay.innerHTML = `Patient DOB: ${patientDOB}<br>Last Name: ${lastName}`;
        dobDisplay.style.display = 'block';
        confirmAndSendButton.style.display = 'block';

        patientIdInput.style.display = 'none';
        continueButton.style.display = 'none';
        document.querySelector('label[for="patientId"]').style.display = 'none';

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

    fetch('https://n8n.amcs.tech/webhook-test/picdemo', {
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

startOverButton.addEventListener('click', () => {
  window.location.reload();
});
