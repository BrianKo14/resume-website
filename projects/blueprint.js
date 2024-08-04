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
	const _padding = 40;

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
    
function scatterElements(elements, width, height) {
	elements.forEach(element => {
		const [x, y] = getRandomInThreeQuadrants(width, height);
		
		// element.style.left = `${x}px`;
		// element.style.top = `${y}px`;
		element.style.transform = 'translate(' + x + 'px, ' + y + 'px)'
		element.setAttribute('data-x', x);
		element.setAttribute('data-y', y);
	});	
}

// const dots_div = document.getElementById('dots');

// for (let i = 0; i < 1000; i++) {
// 	const [x, y] = getRandomInThreeQuadrants(window.innerWidth, window.innerHeight);
// 	// console.log(Math.round(x), Math.round(y));
// 	const element = document.createElement('div');
// 	element.classList.add('test');
// 	element.style.top = `${y}px`;
// 	element.style.left = `${x}px`;
// 	element.setAttribute('data-x', x);
// 	element.setAttribute('data-y', y);

// 	// Add label to show position
// 	const label = document.createElement('span');
// 	label.innerText = `(${x}px, ${y}px)`;
// 	label.classList.add('position-label');
// 	label.style.fontSize = '8px'; // Set the font size to be really small
// 	element.appendChild(label);
// 	dots_div.appendChild(element);

// 	console.log(window.innerWidth, window.innerHeight);
// }

scatterElements(sliders, window.innerWidth, window.innerHeight);



// Scattered elements interactability

interact('.slider')
.draggable({
	inertia: true,

	// Keep within parent's bounds
	modifiers: [
		interact.modifiers.restrictRect({
		  restriction: 'parent',
		  endOnly: true
		})
	],

	// Update position
	listeners: {
		move (event) {
			var target = event.target

			var x = (parseFloat(target.getAttribute('data-x'))) + event.dx
			var y = (parseFloat(target.getAttribute('data-y'))) + event.dy

			// translate the element
			target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

			// update the posiion attributes
			target.setAttribute('data-x', x)
			target.setAttribute('data-y', y)
		}
	}
});