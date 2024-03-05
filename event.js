let banner = document.querySelector('.banner');
let menutoggle = document.querySelector('.toggle');
menutoggle.onclick = function () {
  menutoggle.classList.toggle('active');
  banner.classList.toggle('active');
}

const toggle2 = document.getElementById('toggle2');
toggle2.onclick = function () {
  toggle2.classList.toggle('active');
  document.body.classList.toggle('active');
}