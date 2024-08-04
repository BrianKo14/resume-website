
const isMobile = window.matchMedia('(max-width: 600px)'); // i.e. CSS mobile breakpoint

// Selectors

const projectScatter = document.getElementById('project-scatter');
const sliders = document.querySelectorAll('.slider');



// Randomize initial positions

function getRandomInRange(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}

/** Get random position in top-left, top-right or bottom-right quadrant in the canvas. */
function getRandomInThreeQuadrants(width, height) {
	const quadrant = Math.floor(Math.random() * 3);
	const _padding = 80;

	switch (quadrant) {
		case 0:
			// Top-left
			return [getRandomInRange(_padding, width / 2), getRandomInRange(_padding, height / 2)];
		case 1:
			// Top-right
			return [getRandomInRange(width / 2, width - _padding), getRandomInRange(_padding, height / 2)];
		case 2:
			// Bottom-right
			return [getRandomInRange(width / 2, width - _padding), getRandomInRange(height / 2, height - _padding)];
	}
}

function getRandomInTopHalf(width, height) {
	const _padding = 80;
	return [getRandomInRange(_padding, width - _padding), getRandomInRange(_padding, height / 2 - _padding)];
}

function getRandomPosition(width, height) {
	if (isMobile.matches) {
		return getRandomInTopHalf(width, height);
	} else {
		return getRandomInThreeQuadrants(width, height);
	}
}
    
function scatterElements(elements, width, height) {
	elements.forEach(element => {
		let [x, y] = getRandomPosition(width, height);
		let rotation = getRandomInRange(-20, 20);
		
		element.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) translate(-50%, -50%)`;
		element.setAttribute('data-x', x);
		element.setAttribute('data-y', y);
		element.setAttribute('data-rotation', rotation);
	});	
}

scatterElements(sliders, window.innerWidth, window.innerHeight);



// Scattered elements interactability

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
			target.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) translate(-50%, -50%)`;

			// Update the position attributes
			target.setAttribute('data-x', x);
			target.setAttribute('data-y', y);

			// Move to top
			target.style.zIndex = heighestZIndex++;
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
});