const memberContainer = document.getElementById('members__container');
const memberButton = document.getElementById('members__button');

let activeMemberContainer = false;

memberButton.addEventListener('click', () => {
    if (activeMemberContainer) {
      memberContainer.style.display = 'none';
    } else {
      memberContainer.style.display = 'block';
    }
  
    activeMemberContainer = !activeMemberContainer;
  });