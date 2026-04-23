// THE MAYFAIR LONDON - MAIN JAVASCRIPT
// Handles booking form validation, room pre-selection, and dynamic messages

(function() {
    // Helper: show success or error message on booking page
    function showFormMessage(elementId, message, isError = false) {
        const msgContainer = document.getElementById(elementId);
        if (!msgContainer) return;
        msgContainer.innerHTML = `<div class="${isError ? 'error' : 'success-banner'}" style="margin-bottom:1rem;">${message}</div>`;
        if (!isError) {
            setTimeout(() => {
                if (msgContainer.firstChild) msgContainer.firstChild.remove();
            }, 5000);
        }
    }

    // Clear all field errors inside booking form
    function clearBookingErrors() {
        const errorIds = ['nameError', 'emailError', 'checkinError', 'checkoutError', 'guestsError', 'roomError'];
        errorIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = '';
        });
    }

    // Validate booking form (returns true if valid)
    function validateBookingForm() {
        clearBookingErrors();
        let isValid = true;

        const name = document.getElementById('fullname')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';
        const checkin = document.getElementById('checkin')?.value || '';
        const checkout = document.getElementById('checkout')?.value || '';
        const guests = document.getElementById('guests')?.value || '2';
        const room = document.getElementById('roomSelect')?.value || '';

        // name check
        if (!name) {
            const err = document.getElementById('nameError');
            if (err) err.innerText = 'Full name is required.';
            isValid = false;
        } else if (name.length < 2) {
            const err = document.getElementById('nameError');
            if (err) err.innerText = 'Please enter a valid name.';
            isValid = false;
        }

        // email regex
        const emailPattern = /^[^\s@]+@([^\s@]+\.)+[^\s@]{2,}$/;
        if (!email) {
            const err = document.getElementById('emailError');
            if (err) err.innerText = 'Email address is required.';
            isValid = false;
        } else if (!emailPattern.test(email)) {
            const err = document.getElementById('emailError');
            if (err) err.innerText = 'Enter a valid email address.';
            isValid = false;
        }

        // date logic
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let cinDate = null, coutDate = null;

        if (!checkin) {
            const err = document.getElementById('checkinError');
            if (err) err.innerText = 'Check-in date is required.';
            isValid = false;
        } else {
            cinDate = new Date(checkin);
            if (cinDate < today) {
                const err = document.getElementById('checkinError');
                if (err) err.innerText = 'Check-in cannot be in the past.';
                isValid = false;
            }
        }

        if (!checkout) {
            const err = document.getElementById('checkoutError');
            if (err) err.innerText = 'Check-out date is required.';
            isValid = false;
        } else {
            coutDate = new Date(checkout);
            if (cinDate && coutDate <= cinDate) {
                const err = document.getElementById('checkoutError');
                if (err) err.innerText = 'Check-out must be after check-in.';
                isValid = false;
            }
        }

        // guests range 1-6
        const guestNum = parseInt(guests);
        if (isNaN(guestNum) || guestNum < 1 || guestNum > 6) {
            const err = document.getElementById('guestsError');
            if (err) err.innerText = 'Number of guests must be between 1 and 6.';
            isValid = false;
        }

        // room selection
        if (!room) {
            const err = document.getElementById('roomError');
            if (err) err.innerText = 'Please select a room type.';
            isValid = false;
        }

        return isValid;
    }

    // price calculator based on room type and nights
    function calculateBookingTotal(roomType, checkinStr, checkoutStr) {
        if (!roomType || !checkinStr || !checkoutStr) return null;
        const start = new Date(checkinStr);
        const end = new Date(checkoutStr);
        const nights = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

        const rates = {
            classic: 219,
            deluxe: 289,
            terrace: 429,
            royal: 799
        };
        const rate = rates[roomType] || 289;
        return { nights, total: nights * rate };
    }

    // attach event listener to booking form if it exists
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!validateBookingForm()) {
                showFormMessage('formMessage', '❌ Please correct the errors above.', true);
                return;
            }

            const name = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();
            const checkin = document.getElementById('checkin').value;
            const checkout = document.getElementById('checkout').value;
            const roomSelect = document.getElementById('roomSelect');
            const roomValue = roomSelect.value;
            const roomText = roomSelect.options[roomSelect.selectedIndex]?.text || roomValue;
            const guests = document.getElementById('guests').value;
            const requests = document.getElementById('requests')?.value || 'None';

            const priceInfo = calculateBookingTotal(roomValue, checkin, checkout);
            if (!priceInfo) {
                showFormMessage('formMessage', '⚠️ Please check your dates again.', true);
                return;
            }

            const successMsg = `✅ Booking confirmed, ${name}!<br>
                                📧 Confirmation sent to ${email}<br>
                                🏨 ${roomText} for ${priceInfo.nights} night(s) — Total: £${priceInfo.total}<br>
                                📅 ${checkin} → ${checkout} | Guests: ${guests}<br>
                                ✨ Special requests: ${requests}<br>
                                <strong>📍 The Mayfair London looks forward to welcoming you.</strong>`;

            showFormMessage('formMessage', successMsg, false);
            bookingForm.reset();

            // scroll back to top of form
            document.getElementById('bookingSection')?.scrollIntoView({ behavior: 'smooth' });
        });

        // set minimum dates for check-in / check-out
        const todayStr = new Date().toISOString().split('T')[0];
        const checkinField = document.getElementById('checkin');
        const checkoutField = document.getElementById('checkout');
        if (checkinField) checkinField.min = todayStr;
        if (checkinField && checkoutField) {
            checkinField.addEventListener('change', function() {
                if (checkinField.value) {
                    const nextDay = new Date(checkinField.value);
                    nextDay.setDate(nextDay.getDate() + 1);
                    checkoutField.min = nextDay.toISOString().split('T')[0];
                    if (checkoutField.value && checkoutField.value <= checkinField.value) {
                        checkoutField.value = nextDay.toISOString().split('T')[0];
                    }
                }
            });
        }

        // Clear field errors when user types
        const fields = ['fullname', 'email', 'checkin', 'checkout', 'guests', 'roomSelect'];
        fields.forEach(fid => {
            const el = document.getElementById(fid);
            if (el) {
                el.addEventListener('input', function() {
                    let errId = '';
                    if (fid === 'fullname') errId = 'nameError';
                    else if (fid === 'email') errId = 'emailError';
                    else if (fid === 'checkin') errId = 'checkinError';
                    else if (fid === 'checkout') errId