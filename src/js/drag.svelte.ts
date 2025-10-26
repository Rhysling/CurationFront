import { Spring } from 'svelte/motion';
import type { Attachment } from 'svelte/attachments';

// This experiment doesn't work with the new Spring ***

export const dragAttachment: Attachment = (element) => {
	const node = element as HTMLElement;
	let mx = 0;
	const coordinates = new Spring({ x: 0 }, {
		stiffness: 0.2,
		damping: 0.1,
	});

	// $effect(() => {
	// 	coordinates.current.x;
	// 	node.style.transform = `translate3d(${coordinates.current.x}px, 0,0)`;
	// });

	// Replace store-style subscribe with a RAF loop that reads the spring's value.
	let raf = 0;
	let lastX = NaN;

	const readSpring = () => {
		// Some Spring builds expose .get(); others expose .current; try both safely.
		// const raw = (coordinates as any).get ? (coordinates as any).get() : (coordinates as any).current;
		// const x = raw?.x ?? 0;
		const x = coordinates.current.x;

		if (x !== lastX) {
			lastX = x;
			node.style.transform = `translate3d(${x}px, 0, 0)`;
		}

		raf = requestAnimationFrame(readSpring);
	};

	raf = requestAnimationFrame(readSpring);


	const handleMouseDown = (event: MouseEvent) => {
		mx = event.clientX;
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
	};

	const handleMouseMove = (event: MouseEvent) => {
		// Delta X = difference of where we clicked vs where we are currently
		const dx = event.clientX - mx;
		mx = event.clientX;
		//cx += dx;
		coordinates.target.x += dx;
	};

	const handleMouseUp = () => {
		// Reset values
		//cx = 0;
		coordinates.target.x = 0;

		// Remove event listers
		window.removeEventListener("mousemove", handleMouseMove)
		window.removeEventListener("mouseup", handleMouseUp)
	};

	node.addEventListener("mousedown", handleMouseDown);

	return () => node.removeEventListener("mousedown", handleMouseDown);
};
