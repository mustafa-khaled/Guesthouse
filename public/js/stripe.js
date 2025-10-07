/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51NFC2lEqzfoGLWiIN9n1yuDkTu4dGySEKNbJ72LBcipk7tYY5qBzMyKHWf6oy8beEp3a30EvEydRaqYslzZxIpm400GckBvb2T',
);

const BASE_URL = 'http://localhost:3000/api';

export async function bookTour(tourId) {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `${BASE_URL}/v1/bookings/checkout-session/${tourId}`,
    );

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
}
