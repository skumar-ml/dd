
/**
 * CheckOutWebflow Class is used to intigrate with stripe payment.
 * In this API we pass baseUrl, memberData.
 * In this class we are manipulating student form and member data
 */

class CheckOutWebflow {
	$suppPro = [];
	$checkoutData = "";
	$checkOutResponse = false;
	constructor(apiBaseUrl, memberData) {
		this.baseUrl = apiBaseUrl;
		this.memberData = memberData;
		this.renderPortalData();
	}

	// Get API data with the help of endpoint
	async fetchData(endpoint) {
		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error("Error fetching data:", error);
			throw error;
		}
	}
	// API call for checkout URL 
	initializeStripePayment() {
		return new Promise((resolve, reject) => {
			var suppProIdE = document.getElementById('suppProIds');
			var core_product_price = document.getElementById('core_product_price');

			//Payment button
			var ach_payment = document.getElementById('ach_payment');
			var card_payment = document.getElementById('card_payment');
			var paylater_payment = document.getElementById('paylater_payment');

			ach_payment.innerHTML = "Processing..."
			ach_payment.disabled = true;
			card_payment.innerHTML = "Processing..."
			card_payment.disabled = true;
			paylater_payment.innerHTML = "Processing..."
			paylater_payment.disabled = true;
			//var cancelUrl = new URL("https://www.nsdebatecamp.com"+window.location.pathname);
			var cancelUrl = new URL(window.location.href);
			cancelUrl.searchParams.append('returnType', 'back')
			var data = {
				"email": this.memberData.email,
				"label": this.memberData.programName,
				"programId": this.memberData.programId,
				"successUrl": encodeURI("https://www.debatedrills.com/payment-confirmation?programName=" + this.memberData.programName),
				//"cancelUrl": encodeURI("https://www.debatedrills.com/payment-confirmation?programName=" + this.memberData.programName),
				"cancelUrl" : cancelUrl.href,
				"memberId": this.memberData.memberId,
				"productType": this.memberData.productType,
				"achAmount": parseFloat(this.memberData.achAmount.replace(/,/g, '')),
				"cardAmount": parseFloat(this.memberData.cardAmount.replace(/,/g, '')),
				"payLaterAmount": parseFloat(this.memberData.payLaterAmount.replace(/,/g, '')),
				"device": (/Mobi|Android/i.test(navigator.userAgent)) ? 'Mobile' : 'Desktop',
				"deviceUserAgent": navigator.userAgent
			}

			var xhr = new XMLHttpRequest()
			var $this = this;
			$this.$checkOutResponse = false;
			xhr.open("POST", this.baseUrl+"createCheckoutUrlsByProgram", true)
			xhr.withCredentials = false
			xhr.send(JSON.stringify(data))
			xhr.onload = function () {
				let responseText = JSON.parse(xhr.responseText);
				if (responseText.success) {
					// btn.innerHTML = 'Checkout';
					// window.location.href = responseText.stripe_url;

					$this.$checkoutData = responseText;
					//Storing data in local storage
					data.checkoutData = responseText
					localStorage.setItem("checkOutData", JSON.stringify(data));
					ach_payment.innerHTML = "Checkout"
					ach_payment.disabled = false;
					card_payment.innerHTML = "Checkout"
					card_payment.disabled = false;
					paylater_payment.innerHTML = "Checkout"
					paylater_payment.disabled = false;
					$this.$checkOutResponse = true;
					console.log('resolve')
					resolve(responseText);
					//next_page_2.style.pointerEvents = "auto";
				} else {
					reject(new Error('API call failed'));
				}

			}
		});
	}

	// API call for checkout URL 
	updateStudentDetails(checkoutUrl) {
		var studentFirstName = document.getElementById('Student-First-Name');
		var studentLastName = document.getElementById('Student-Last-Name');
		var studentEmail = document.getElementById('Student-Email');
		var studentGrade = document.getElementById('Student-Grade');

		//Payment button
		var ach_payment = document.getElementById('ach_payment');
		var card_payment = document.getElementById('card_payment');
		var paylater_payment = document.getElementById('paylater_payment');
		ach_payment.innerHTML = "Processing..."
		ach_payment.disabled = true;
		card_payment.innerHTML = "Processing..."
		card_payment.disabled = true;
		paylater_payment.innerHTML = "Processing..."
		paylater_payment.disabled = true;
		//var cancelUrl = new URL("https://www.nsdebatecamp.com"+window.location.pathname);
		var cancelUrl = new URL(window.location.href);
		cancelUrl.searchParams.append('returnType', 'back')
		var data = {
			"studentEmail": studentEmail.value,
			"firstName": studentFirstName.value,
			"lastName": studentLastName.value,
			"grade": studentGrade.value,
			"label": this.memberData.programName,
			"memberId": this.memberData.memberId,
			"checkoutUrls": checkoutUrl,

		}
		var checkoutData = localStorage.getItem('checkOutData');
		var mergedData = {
			...data,
			...JSON.parse(checkoutData)
		}
		localStorage.setItem("checkOutData", JSON.stringify(mergedData));
		var xhr = new XMLHttpRequest()
		var $this = this;
		xhr.open("POST", this.baseUrl+"updateStripeCheckoutDb", true)
		xhr.withCredentials = false
		xhr.send(JSON.stringify(data))
		xhr.onload = function () {
			console.log('Updated student details')
			ach_payment.innerHTML = "Checkout"
			ach_payment.disabled = false;
			card_payment.innerHTML = "Checkout"
			card_payment.disabled = false;
			paylater_payment.innerHTML = "Checkout"
			paylater_payment.disabled = false;

		}
	}
	// Hide and show tab for program selection, student infor and checkout payment
	activateDiv(divId) {
		var divIds = ["checkout_program", "checkout_student_details", "checkout_payment"];
		// Remove the active class from all div elements
		divIds.forEach((id) => document.getElementById(id).classList.remove("active_checkout_tab"));
		// Add the active class to the div with the specified id
		document.getElementById(divId).classList.add("active_checkout_tab");
	}
	// Managing next and previous button
	addEventForPrevNext() {
		var initialCheckout = null
		var next_page_1 = document.getElementById("next_page_1");
		var next_page_2 = document.getElementById("next_page_2");
		var prev_page_1 = document.getElementById("prev_page_1");
		var prev_page_2 = document.getElementById("prev_page_2");
		var checkoutFormError = document.getElementById("checkout-form-error");
		var $this = this;
		var form = $("#checkout-form");
		next_page_1.addEventListener("click", function () {
			$this.activateDiv("checkout_student_details");
			//initialCheckout = $this.initializeStripePayment();
			initialCheckout = true;
		});
		next_page_2.addEventListener("click", function () {
			if (form.valid()) {
				$this.storeBasicData();
				// validation for student email different form Parent email
				var isValidName = $this.checkUniqueStudentEmail();
				if (isValidName) {
					checkoutFormError.style.display = "none";
					$this.activateDiv("checkout_payment");
					//  while ($this.$checkOutResponse == false) {
					//  	console.log('Got API response')
					//  }
					//if (initialCheckout) {
						//console.log('initialCheckout', initialCheckout)
						//initialCheckout.then(() => {
							var checkoutData = [$this.$checkoutData.achUrl, $this.$checkoutData.cardUrl, $this.$checkoutData.payLaterUrl];
							$this.updateStudentDetails(checkoutData);
						//})
					//}

				} else {
					checkoutFormError.style.display = "block";
				}
			}
		});
		prev_page_1.addEventListener("click", function () {
			$this.activateDiv("checkout_program");
		});
		prev_page_2.addEventListener("click", function () {
			// click on back button reinitialze payment tab
			document.getElementsByClassName("bank-transfer-tab")[0].click();
			//document.getElementById('w-tabs-1-data-w-tab-0').click()
			setTimeout(function () {
				$(".w-tab-link").removeClass("w--current");
				$(".w-tab-pane").removeClass("w--tab-active");
				Webflow.require("tabs").redraw();
			}, 2000);

			$this.activateDiv("checkout_student_details");
		});
	}
	// validating duplicate email
	checkUniqueStudentEmail() {
		var sENameE = document.getElementById("Student-Email");
		var sEmail = sENameE.value;
		sEmail = sEmail.replace(/\s/g, "");
		sEmail = sEmail.toLowerCase();
		var pEmail = this.memberData.email;
		pEmail = pEmail.replace(/\s/g, "");
		pEmail = pEmail.toLowerCase();
		if (sEmail == pEmail) {
			return false;
		} else {
			return true;
		}
	}
	// handle payment button click
	handlePaymentEvent() {
		var ach_payment = document.getElementById("ach_payment");
		var card_payment = document.getElementById("card_payment");
		var paylater_payment = document.getElementById("paylater_payment");
		// Browser back button event hidden fields
		var iBackButton = document.getElementById("backbuttonstate");
		var $this = this;
		ach_payment.addEventListener("click", function () {
			// ach_payment.innerHTML = "Processing..."
			// $this.initializeStripePayment('us_bank_account', ach_payment);
			iBackButton.value = "1";
			window.location.href = $this.$checkoutData.achUrl;
		});
		card_payment.addEventListener("click", function () {
			// card_payment.innerHTML = "Processing..."
			// $this.initializeStripePayment('card', card_payment);
			iBackButton.value = "1";
			window.location.href = $this.$checkoutData.cardUrl;
		});
		paylater_payment.addEventListener("click", function () {
			// paylater_payment.innerHTML = "Processing..."
			// $this.initializeStripePayment('paylater', paylater_payment);
			iBackButton.value = "1";
			window.location.href = $this.$checkoutData.payLaterUrl;
		});
	}

	// Setup back stripe button and browser back button
	setUpBackButtonTab() {
		var query = window.location.search;
		var urlPar = new URLSearchParams(query);
		var returnType = urlPar.get("returnType");
		// Get local storage data for back button
		var checkoutJson = localStorage.getItem("checkOutData");
		// Browser back button event hidden fields
		var iBackButton = document.getElementById("backbuttonstate");
		if ((returnType == "back" || iBackButton.value == 1) && checkoutJson != undefined) {
			var paymentData = JSON.parse(checkoutJson);
			//console.log('checkoutData', paymentData)
			var studentFirstName = document.getElementById("Student-First-Name");
			var studentLastName = document.getElementById("Student-Last-Name");
			var studentEmail = document.getElementById("Student-Email");
			var studentGrade = document.getElementById("Student-Grade");
			// Update all local storage data
			studentEmail.value = paymentData.studentEmail;

			studentFirstName.value = paymentData.firstName;

			studentLastName.value = paymentData.lastName;

			if (paymentData.grade) {
				studentGrade.value = paymentData.grade;
			}

			if (paymentData.checkoutData) {
				this.$checkoutData = paymentData.checkoutData;
				this.activateDiv("checkout_payment");
			}
		} else {
			// removed local storage when checkout page rendar direct without back button
			localStorage.removeItem("checkOutData");
		}
	}
	// Store student basic forms data
	storeBasicData() {
		var studentFirstName = document.getElementById("Student-First-Name");
		var studentLastName = document.getElementById("Student-Last-Name");
		var studentEmail = document.getElementById("Student-Email");
		var studentGrade = document.getElementById("Student-Grade");
		//save data in local storage
		var data = {
			studentEmail: studentEmail.value,
			firstName: studentFirstName.value,
			lastName: studentLastName.value,
			grade: studentGrade.value,
			label: this.memberData.programName,
		};
		localStorage.setItem("checkOutBasicData", JSON.stringify(data));
	}
	// Update Basic data after reload
	updateBasicData() {
		var checkoutJson = localStorage.getItem("checkOutBasicData");
		if (checkoutJson != undefined) {
			var paymentData = JSON.parse(checkoutJson);
			var studentFirstName = document.getElementById("Student-First-Name");
			var studentLastName = document.getElementById("Student-Last-Name");
			var studentEmail = document.getElementById("Student-Email");
			var studentGrade = document.getElementById("Student-Grade");

			studentEmail.value = paymentData.studentEmail;

			studentFirstName.value = paymentData.firstName;

			studentLastName.value = paymentData.lastName;

			if (paymentData.grade) {
				studentGrade.value = paymentData.grade;
			}
		}
	}
	// After API response we call the createMakeUpSession method to manipulate student data
	async renderPortalData(memberId) {
		try {
			// Handle checkout button
			this.handlePaymentEvent();
			// Handle previous and next button
			this.addEventForPrevNext();
			// activate program tab
			this.activateDiv("checkout_student_details");
			// loader icon code
			var spinner = document.getElementById("half-circle-spinner");
			spinner.style.display = "block";

			var initStripe = await this.initializeStripePayment();
			// Setup back button for browser and stripe checkout page
			this.setUpBackButtonTab();
			// Update basic data
			this.updateBasicData();
			// Hide spinner
			spinner.style.display = "none";
		} catch (error) {
			console.error("Error rendering random number:", error);
		}
	}
}
