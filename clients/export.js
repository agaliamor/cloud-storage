const form = document.querySelector('form[name="form"]');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const username = formData.get('email');
  const password = formData.get('password');

  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password })
    });

    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.log("err");
  }
});


const login = document.querySelector("form[name=login]")

login.addEventListener('submit',async(event)=>{
  event.preventDefault()

  const formLogin = new FormData(login);
  const username = formLogin.get('email');
  const password = formLogin.get('password');
  
  try {
    const responseLog = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password })
    });

    const dataLog = await responseLog.json();
    console.log(dataLog, );
  } catch (err) {
    console.log("gg");
  }
})