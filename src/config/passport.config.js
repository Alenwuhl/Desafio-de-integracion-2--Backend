import passport from "passport";
//Para usar JWT como estrategia.
import jwtStrategy from 'passport-jwt'
import { PRIVATE_KEY } from "../util";
import studentsModel from '../services/db/models/students.js'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';



const initializePassport = () => {

    const options = {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: PRIVATE_KEY,
    };
    //TODO generar las reglas para extraer el token y las autorizaciones necesarias.
    passport.use(new JwtStrategy(options, async (jwt_payload, done) => {
        try {
            // Buscar el usuario en base al ID incluido en el JWT
            const user = await studentsModel.findById(jwt_payload.id);
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    }));
    //Funciones de Serializacion y Desserializacion
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            let user = await studentsModel.findById(id);
            done(null, user);
        } catch (error) {
            console.error("Error deserializando el usuario: " + error);
        }
    });
};

/**
 * Metodo utilitario en caso de necesitar extraer cookies con Passport
 * @param {*} req el request object de algun router.
 * @returns El token extraido de una Cookie
 */
const cookieExtractor = req => {
    let token = null;
    console.log("Entrando a Cookie Extractor");
    if (req && req.cookies) { //Validamos que exista el request y las cookies.
        console.log("Cookies presentes: ");
        console.log(req.cookies);
        token = req.cookies['jwtCookieToken']; //-> Tener presente este nombre es el de la Cookie.
        console.log("Token obtenido desde Cookie:");
        console.log(token);
    }
    return token;
};

export default initializePassport;