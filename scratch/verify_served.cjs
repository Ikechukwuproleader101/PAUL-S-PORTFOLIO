async function verify() {
  const [htmlRes, imgRes] = await Promise.all([
    fetch('http://localhost:3000/'),
    fetch('http://localhost:3000/assets/camera/moonshake-camera.png')
  ]);
  const html = await htmlRes.text();
  console.log('HTML status:', htmlRes.status);
  console.log('HTML contains #architectural-hero:', html.includes('id="architectural-hero"'));
  console.log('HTML contains data-hero-section:', html.includes('data-hero-section'));
  console.log('HTML contains data-hero-panel:', html.includes('data-hero-panel'));
  console.log('Camera image HTTP status:', imgRes.status);
}

verify().catch(console.error);
