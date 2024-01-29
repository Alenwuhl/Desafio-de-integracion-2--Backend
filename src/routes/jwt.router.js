import { Router } from "express";
import { isValidPassword, generateJWToken } from "../util.js";
//Service import
import StudentService from "../services/db/students.service.js";

const router = Router();
const studentService = new StudentService();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await studentService.findByUsername(email);
    console.log("Usuario encontrado para login:");
    console.log(user);
    if (!user) {
      console.warn("User doesn't exists with username: " + email);
      return res
        .status(400)
        .send({
          error: "Not found",
          message: "Usuario no encontrado con username: " + email,
        });
    }
    if (!isValidPassword(user, password)) {
      console.warn("Invalid credentials for user: " + email);
      return res
        .status(401)
        .send({
          status: "error",
          error: "El usuario y la contraseña no coinciden!",
        });
    }
    const tokenUser = {
      name: `${user.name} ${user.lastName}`,
      email: user.email,
      age: user.age,
      role: user.role,
    };
    const access_token = generateJWToken(tokenUser);
    console.log(access_token);
    //Con Cookie
    res.cookie("jwtCookieToken", access_token, {
      maxAge: 60000,
      httpOnly: true,
    });
    res.send({ message: "Login successful!" });
    //const access_token = generateJWToken(tokenUser); //-->Con access_token
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ status: "error", error: "Error interno de la applicacion." });
  }
});

router.post("/register", async (req, res) => {
    const { email, password, age, name, lastName } = req.body;
  
    try {
      const existingUser = await studentService.findByUsername(email);
      if (existingUser) {
        return res.status(409).send({ message: "Este email ya está en uso." });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = {
        email,
        password: hashedPassword,
        age,
        name,
        lastName,
        role,
        courses
      };
  
      const savedUser = await studentService.save(newUser);
  
      // Enviar una respuesta exitosa
      res.status(201).send({ message: "Usuario registrado con éxito", user: savedUser });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Error al registrar el usuario" });
    }
  });
  
export default router;
