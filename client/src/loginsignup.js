let signupform = document.getElementById("signupForm");
signupform.addEventListener("submit", async (event) => {
  event.preventDefault();
  let email = signupform.signupEmail.value;
  let password = signupform.signupPassword.value;
  let data_obj = {
    email,
    password,
  };
  console.log(JSON.stringify(data_obj));
  let res = await fetch(`http://localhost:8000/user/signup`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  let jsonData = await res.json()
  console.log(jsonData)
 
  if(jsonData.msg==="User added"){
    alert("signup success please login")

  }
  else 
  if(jsonData.msg==='User exists. Please login'){
    alert("you are already registered please login")
  }
});

let loginform = document.getElementById("loginForm");
loginform.addEventListener("submit", async (event) => {
  event.preventDefault();
  let email = loginform.loginEmail.value;
  let password = loginform.loginPassword.value;
  let data_obj = {
    email,
    password,
  };

  let res = await fetch(`http://localhost:8000/user/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  let data = await res.json()
  console.log(data)
  let {token} = data
  if(token){
    localStorage.setItem("token",token)
    location.href = "./index.html"
  }else if(data.msg ==="Invalid email or password"){
    alert("wrong crendentials please try again")
    location.reload()
  }
 
});
