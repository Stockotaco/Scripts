function flEvent(event, data, sendToDl) {
	const eventData = data || {};
	// console.log(`the dataType is ${typeof(data)}`)
	if (typeof data === 'object') {
		const dlEvent = function () {
			window.dataLayer = window.dataLayer || [];
			window.dataLayer.push({
				event: `fl-${event}`,
				eventData,
			});
			console.log(`fl-${event} dataLayer event sent`);
		};
		if (!sendToDl) {
			// if the third function argument is falsy (empty), trigger the dataLayer event by default
			dlEvent();
		}
		try {
			window.funnelytics.events.trigger(event, eventData);
		} catch (error) {
			// console.error(error);
			const checker = window.setInterval(function () {
				if (!window.funnelytics) {
					console.log('searching for window.funnelytics');
					return;
				}
				if (!window.funnelytics.step) {
					console.log('searching for window.funnelytics.step');
					return;
				}
				window.funnelytics.events.trigger(event, eventData);
				window.clearInterval(checker);
			}, 200);
		}
	} else {
		console.log(
			`Funnelytics expected an object for the 'data' argument. Instead a(n) ${typeof data} was passed to the argument.`
		);
	}
}
