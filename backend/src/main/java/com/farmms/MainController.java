package com.farmms;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    // http://localhost:8080/ 접속 시 static/start.html로 이동
    @GetMapping("/")
    public String mainPage() {
        return "redirect:/start.html";
    }

    // http://localhost:8080/login 접속 시 static/login.html로 이동
    @GetMapping("/login")
    public String loginPage() {
        return "redirect:/login.html";
    }

    // http://localhost:8080/signup 접속 시 static/signup.html로 이동
    @GetMapping("/signup")
    public String signupPage() {
        return "redirect:/signup.html";
    }

    // http://localhost:8080/maindashboard 접속 시 static/maindashboard.html로 이동
    @GetMapping("/maindashboard")
    public String dashboardPage() {
        return "redirect:/maindashboard.html";
    }
}