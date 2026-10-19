// Open the donate modal from anywhere (DonateWidget listens for this event)
export const openDonate = () => window.dispatchEvent(new Event('open-donate'));
