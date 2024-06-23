// Get modal element
var modal = document.getElementById('modal')
// Get open modal buttons
var createPostBtn = document.querySelector('label[for="create-post"]')
var createPostInput = document.getElementById('create-post')
// Get close button
var closeBtn = document.getElementsByClassName('close')[0]

// Listen for open click
createPostBtn.addEventListener('click', openModal)
createPostInput.addEventListener('click', openModal)

// Listen for close click
closeBtn.addEventListener('click', closeModal)

// Listen for outside click
window.addEventListener('click', outsideClick)

// Function to open modal
function openModal(event) {
  event.preventDefault()
  modal.style.display = 'block'
}

// Function to close modal
function closeModal() {
  modal.style.display = 'none'
}

// Function to close modal if outside click
function outsideClick(e) {
  if (e.target == modal) {
    modal.style.display = 'none'
  }
}
