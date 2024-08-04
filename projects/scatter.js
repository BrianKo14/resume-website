
const isMobile = window.matchMedia('(max-width: 600px)'); // i.e. CSS mobile breakpoint

// Selectors

const projectScatter = document.getElementById('project-scatter');
const sliders = document.querySelectorAll('.slider');



// Randomize initial positions

function getRandomInRange(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}

/** Get random position in top-left, top-right or bottom-right quadrant in the canvas. */
function getRandomInThreeQuadrants(width, height, size) {
	const quadrant = Math.floor(Math.random() * 3);
	const _padding = 80;

	switch (quadrant) {
		case 0:
			// Top-left
			return [getRandomInRange(_padding, width / 2), getRandomInRange(_padding, height / 2)];
		case 1:
			// Top-right
			return [getRandomInRange(width / 2, width - _padding - size[0]), getRandomInRange(_padding, height / 2)];
		case 2:
			// Bottom-right
			return [getRandomInRange(width / 2, width - _padding - size[0]), getRandomInRange(height / 2, height - _padding - size[1])];
	}
}

function getRandomInTopHalf(width, height, size) {
	const _padding = 80;
	return [getRandomInRange(_padding, width - _padding - size[0]), getRandomInRange(_padding, height / 2 - _padding - size[1])];
}

function getRandomPosition(width, height, size) {
	if (isMobile.matches) {
		return getRandomInTopHalf(width, height, size);
	} else {
		return getRandomInThreeQuadrants(width, height, size);
	}
}
    
function scatterElements(elements, width, height) {
	elements.forEach(element => {
		let [x, y] = getRandomPosition(width, height, [element.offsetWidth, element.offsetHeight]);
		let rotation = getRandomInRange(-20, 20);
		
		element.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
		element.setAttribute('data-x', x);
		element.setAttribute('data-y', y);
		element.setAttribute('data-rotation', rotation);
	});	
}

scatterElements(sliders, window.innerWidth, window.innerHeight);



/*
	Scattered elements interactability

	- The parent '.slider' element is draggable.
	- The child '.slider img' element is enlarged and (un)rotated.
*/

var heighestZIndex = 5;

interact('.slider')
.draggable({
	inertia: true,

	autoScroll: true,

	// Keep within parent's bounds
	modifiers: [
		interact.modifiers.restrictRect({
		  restriction: 'parent',
		  endOnly: true
		})
	],

	// Update position
	listeners: {
		move: (event) => {
			const target = event.target;
			event.preventDefault();
			
			let x = parseFloat(target.getAttribute('data-x')) + event.dx;
			let y = parseFloat(target.getAttribute('data-y')) + event.dy;
			let rotation = parseFloat(target.getAttribute('data-rotation'));

			// Translate the element
			target.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;

			// Update the position attributes
			target.setAttribute('data-x', x);
			target.setAttribute('data-y', y);
		},

		start: (event) => {
			const target = event.target;

			let rotation = parseFloat(target.getAttribute('data-rotation'));

			anime({
				targets: target.children[0],
				rotate: -rotation,
				scale: 1.2,
				duration: 700,
				easing: 'easeOutQuint'
			});

			// Hide modal
			hideModal();

			// Move to top
			target.style.zIndex = heighestZIndex++;
		},

		end: (event) => {
			const target = event.target;

			// Snap back to original position
			anime({
				targets: target.children[0],
				scale: 1,
				rotate: 0,
				duration: 1000,
				easing: 'easeOutQuint'
			});
		}
	}
})

// Double tap slider
.on('doubletap', (event) => { if (!isMobile.matches) {
	const target = event.target;
	const targetParent = target.parentElement;
	event.preventDefault();

	let x = parseFloat(targetParent.getAttribute('data-x'));
	let y = parseFloat(targetParent.getAttribute('data-y'));
	let rotation = parseFloat(targetParent.getAttribute('data-rotation'));

	// Enlargen and rotate
	anime({
		targets: target,
		scale: 1.8,
		rotate: -rotation,
		duration: 1000,
		easing: 'easeOutQuint'
	});

	// Translate the element
	let new_x = window.innerWidth / 2 - target.offsetWidth / 2;
	let new_y = window.innerHeight / 2 - target.offsetHeight / 2 - 50;

	let diff_x = new_x - x;
	let diff_y = new_y - y;

	anime({
		targets: targetParent,
		duration: 500,
		easing: 'easeInOutSine',
		update: (anim) => {
			let progress = anim.progress;

			// Update position from current to center
			let update_x = x + diff_x * progress / 100;
			let update_y = y + diff_y * progress / 100;
			// console.log(progress, x, y, new_x, new_y);
			targetParent.style.transform = `translate(${update_x}px, ${update_y}px) rotate(${rotation}deg)`;

			// Update the position attributes
			targetParent.setAttribute('data-x', update_x);
			targetParent.setAttribute('data-y', update_y);
		}
	});

	// Show modal
	showModal(target);

	// Move to top
	targetParent.style.zIndex = heighestZIndex++;
} });



// Modal

const modal = document.getElementById('modal');
var currentSelected = null;

function showModal(element) {
	modal.style.display = 'block';
	modal.style.zIndex = heighestZIndex++;

	anime({
		targets: modal,
		opacity: [0, 0.8],
		easing: 'easeOutQuint',
		duration: 1000,
		complete: () => {
			modal.addEventListener('click', clickOutsideModal);
		}
	});

	currentSelected = element.parentElement;

	modal.children[0].innerHTML = currentSelected.getAttribute('description');
}

function hideModal() {
	if (currentSelected === null) return;
	currentSelected = null;

	anime({
		targets: modal,
		opacity: 0,
		easing: 'easeOutQuint',
		duration: 1000,
		complete: () => {
			modal.removeEventListener('click', clickOutsideModal);
			modal.style.display = 'none';
		}
	});
}

// Clicking outside the modal closes it
function clickOutsideModal() {
	anime({
		targets: currentSelected.children[0],
		scale: 1,
		rotate: 0,
		duration: 1000,
		easing: 'easeOutQuint'
	});

	hideModal();
}