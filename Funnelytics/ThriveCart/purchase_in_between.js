// Instructions: Add 'productName' to upsells and downsells.

// Detect the type of page automatically
var pageType = window._context.page_mode; // checkout, upsell, confirm

function flEvent(event, data, sendToDl) {
	const eventData = data || {};
	// console.log(`the dataType is ${typeof(data)}`)
	if (typeof data === 'object') {
		// define the dlEvent
		const dlEvent = function () {
			window.dataLayer = window.dataLayer || [];
			window.dataLayer.push({
				event: `fl-${event}`,
				eventData,
			});
			console.log(`fl-${event} dataLayer event sent`);
		};
		if (!sendToDl) {
			// if the third function argument is falsy (empty or 0), trigger the dataLayer event by default
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
			}, 100);
		}
	} else {
		console.log(
			`flEvent dataType is expecting an object. Instead it's a(n) ${typeof data}`
		);
	}
}

switch (pageType) {
	case 'checkout':
		// Detect the main order form submission
		$('#form-order').on('submit', function () {
			// Assign Main and/or bump variables
			let mainProductName = $('.order-details-section .order-details-name')[0]
				.innerText;
			let bumpProductName = $('.order-details-section .order-details-name')[1]
				.innerText;
			let mainProductPriceFull = $('.order-details-section em')[0].innerText;
			let bumpProductPriceFull = $('.order-details-section em')[1].innerText;
			let mainProductPrice = +mainProductPriceFull.replace('$', '');
			let bumpProductPrice = +bumpProductPriceFull.replace('$', '');
			arrNameFieldValues = [];
			arrFormNameFieldValues = [];
			$('[name*="name"]:visible').each(function () {
				// const formNameFieldName = $(this).attr('name');
				const formNameFieldValue = $(this).val();
				// console.log(`${formNameFieldName} has a value of ${formNameFieldValue}`)
				if (formNameFieldValue) {
					window.arrFormNameFieldValues.push(formNameFieldValue);
				}
			});
			const visitorName = arrFormNameFieldValues.toString().replace(/,/g, ' ');
			const visitorEmail = $('[name*="email"]').val();
			// console.log('The Main Checkout Form Was Submitted');
			let isBumpActive = $('div[class^="bump-checkbox"]').attr('class'); // Get's the class name of the bump checkbox. If it's undefined - there is no bump product.
			if (isBumpActive == 'bump-checkbox active') {
				console.log('Bump Is Active');
				flEvent('purchase', {
					product: mainProductName,
					price: mainProductPrice,
					name: visitorName,
					email: visitorEmail,
				});
				flEvent('purchase', {
					product: bumpProductName,
					price: bumpProductPrice,
				});
			} else {
				console.log('Bump Is Inactive');
				flEvent('purchase', {
					product: mainProductName,
					price: mainProductPrice,
					name: visitorName,
					email: visitorEmail,
				});
			}
		});
		break;
	case 'upsell':
		// Detect If Upsell/downsell Was Accepted
		$("form[name='upsell-accept']").submit(function () {
			let addonPriceFull = $("form[name='upsell-accept']").attr('data-amount');
			let addonPrice = addonPriceFull / 100;
			// console.log(addonPrice);
			flEvent('purchase', {
				product: productName,
				price: addonPrice,
			});
		});

		// Detect if Upsell/downsell Was Rejected
		$("form[name='upsell-decline']").submit(function () {
			flEvent('reject-click', {
				product: productName,
			});
		});
		break;
	case 'confirm':
		break;
}
