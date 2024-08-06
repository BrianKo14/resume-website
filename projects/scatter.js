
const isMobile = window.matchMedia('(max-width: 600px)'); // i.e. CSS mobile breakpoint
const _baseZIndex = 3; // Base z-index for sliders

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
			return [getRandomInRange(_padding / 2, width / 2), getRandomInRange(_padding, height / 2 - _padding * 3)];
		case 1:
			// Top-right
			return [getRandomInRange(width / 2, width - _padding * 2 - size[0]), getRandomInRange(_padding, height / 2)];
		case 2:
			// Bottom-right
			return [getRandomInRange(width / 2, width - _padding * 2 - size[0]), getRandomInRange(height / 2, height - _padding - size[1])];
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
		element.style.zIndex = getRandomInRange(_baseZIndex, elements.length + _baseZIndex);
	});	
}

scatterElements(sliders, window.innerWidth, window.innerHeight);



/*
	Scattered elements interactability

	- The parent '.slider' element is draggable.
	- Its [first child] is enlarged and (un)rotated. The [first child] can be a container for anything or simply an img.
*/

var heighestZIndex = sliders.length + _baseZIndex;
var currentSelected = null;

interact('.slider')
.styleCursor(false)
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

		// MOVE: Update position attributes
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

		// START MOVE
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

			// Move to top
			target.style.zIndex = heighestZIndex++;

			putBackSlider(target);
		},

		// END MOVE
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

// TAP
.on('tap', (event) => { if (!isMobile.matches && currentSelected === null) {
	const target = event.target.closest('.slider');
	const firstChild = target.children[0];
	event.preventDefault();

	let rotation = parseFloat(target.getAttribute('data-rotation'));

	// Enlargen and rotate
	anime({
		targets: firstChild,
		scale: 1.8,
		rotate: -rotation,
		duration: 1000,
		easing: 'easeOutQuint'
	});

	// Save current selected
	currentSelected = target;

	// Move to center
	moveSliderToCenter(firstChild);

	// Show modal
	showModal();

	// Move to top
	target.style.zIndex = heighestZIndex++;

	// Show video controls
	showVideoControls(firstChild);
} });

// Hover over .slider element
sliders.forEach(slider => {
	slider.addEventListener('mouseenter', () => {
		document.getElementById('magicMouseCursor').style.opacity = 0;
		document.getElementById('magicPointer').classList.add('invert');
	});
	slider.addEventListener('mouseleave', () => {
		document.getElementById('magicMouseCursor').style.opacity = 1;
		document.getElementById('magicPointer').classList.remove('invert');
	});
});

function moveSliderToCenter(target) {
	const targetParent = target.parentElement;

	let x = parseFloat(targetParent.getAttribute('data-x'));
	let y = parseFloat(targetParent.getAttribute('data-y'));
	let rotation = parseFloat(targetParent.getAttribute('data-rotation'));

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
			targetParent.style.transform = `translate(${update_x}px, ${update_y}px) rotate(${rotation}deg)`;

			// Update the position attributes
			targetParent.setAttribute('data-x', update_x);
			targetParent.setAttribute('data-y', update_y);
		}
	});
}

function showVideoControls(target) {
	if (target.classList.contains('video-container')) {
		target.children[0].controls = true;
		target.children[0].play();
		target.querySelectorAll('.play-button')[0].style.display = 'none';
	}
}

function hideVideoControls(target) {
	if (target.classList.contains('video-container')) {
		target.children[0].controls = false;
		target.children[0].pause();
		target.querySelectorAll('.play-button')[0].style.display = 'block';
	}
}

function putBackSlider(target) {
	if (currentSelected === null) return;

	// Hide modal
	hideModal();

	// Hide video controls
	hideVideoControls(target.children[0]);

	currentSelected = null;
}

// Modal

const modal = document.getElementById('modal');

function showModal() {
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

	modal.children[0].innerHTML = currentSelected.getAttribute('description');
}

function hideModal() {
	modal.removeEventListener('click', clickOutsideModal);

	anime({
		targets: modal,
		opacity: 0,
		easing: 'easeOutQuint',
		duration: 1000,
		complete: () => {
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

	putBackSlider(currentSelected);
}