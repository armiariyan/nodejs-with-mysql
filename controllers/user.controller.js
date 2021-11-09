const models = require('../models');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Validator = require('fastest-validator');

function register(req, res) {
    // Mengambil data user yang diinputkan di body
    const user = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }

    // Validasi data menggunakan fastest-validator
    // Pembuatan schema. Optional false berarti required
    const schema = {
        username: {
            type: "string",
            optional: false,
            max: "100"
        },
        email: {
            type: "string",
            optional: false,
            max: "500"
        },
        password: {
            type: "string",
            optional: false,
            min: 6
        }
    }

    // Inisiasi dan Validasi inputan user terhadap schema
    const v = new Validator();
    const validationResponse = v.validate(user, schema);

    // Jika validasi tidak true maka kembalikan error
    if (validationResponse !== true) {
        return res.status(400).json({
            message: "Validation failed",
            errors: validationResponse
        });
    }

    // Cek database apakah ada email yang sama
    models.User.findOne({
        where: {
            email: req.body.email
        }
    }).then(result => {
        // Jika ada, tampilkan error
        if (result) {
            res.status(409).json({
                message: "Email already exists!",
            });
        }
        // Tidak ada error maka lanjut
        else {
            // Hash password dengan bcryptjs
            // genSalt() itu membuat salt untuk ditambahkan ke dalam password normal agar menjadi acak
            bcryptjs.genSalt(10, function (err, salt) {
                // Setelah salt jadi langsung di hash, parameter pertama itu plain text password, parameter kedua itu salt hasil genSalt()
                bcryptjs.hash(req.body.password, salt, function (err, hash) {
                    // Ganti user password dengan yang sudah di hash
                    user.password = hash
                    // Register User baru yang sudah tervalidate dan dihashed passwordnya
                    models.User.create(user).then(result => {
                        res.status(201).json({
                            message: "User created successfully",
                            data: user
                        });
                    }).catch(error => {
                        res.status(500).json({
                            message: "Something went wrong!",
                            info: error
                        });
                    });
                });
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
            info: error
        });
    });



}

function login(req, res) {
    // Mengambil data user yang diinputkan di body
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    // Validasi data menggunakan fastest-validator
    // Pembuatan schema. Optional false berarti required
    const schema = {
        email: {
            type: "string",
            optional: false,
            max: "500"
        },
        password: {
            type: "string",
            optional: false,
            min: 6
        }
    }

    // Inisiasi dan Validasi inputan user terhadap schema
    const v = new Validator();
    const validationResponse = v.validate(user, schema);

    // Jika validasi tidak true maka kembalikan error
    if (validationResponse !== true) {
        return res.status(400).json({
            message: "Validation failed",
            errors: validationResponse
        });
    }

    // Cek database apakah email terdaftar
    models.User.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
        // Jika email tidak terdaftar / null maka error dengan message
        if (user === null) {
            res.status(401).json({
                message: "Invalid credentials!",
            });
        } else {
            // Jika terdaftar maka compare antara password di database dengan yang diinput
            bcryptjs.compare(req.body.password, user.password, function (err, result) {
                // Jika password match / result === true
                if (result) {
                    // Generate token
                    const token = jwt.sign({
                        email: user.email,
                        userId: user.id
                    }, "TestDompetKilat", {
                        expiresIn: '24h'
                    })
                    res.status(200).json({
                        message: "Authentication successful!",
                        token: token
                    });
                } else {
                    res.status(401).json({
                        message: "Invalid credentials!",
                    });
                }
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
        });
    });
}

module.exports = {
    register: register,
    login: login
}