const models = require('../models');
const faker = require('faker');
const Validator = require('fastest-validator');
const ExcelJS = require('exceljs');
const fs = require('fs');
const csv = require('csvtojson');

function show(req, res) {
    const id = req.params.id;

    models.Data.findByPk(id).then(result => {
        if (result) {
            res.status(200).json(result);
        } else {
            res.status(404).json({
                message: "Data not found!"
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
            info: error
        });
    })

}

function index(req, res) {

    models.Data.findAll().then(result => {
        res.status(200).json({
            totalData: result.length,
            data: result
        });
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
            info: error
        });
    })

}

async function pagination(req, res) {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    const allData = await models.Data.findAll();

    models.Data.findAll({
        limit: limit,
        offset: limit * (page - 1)
    }).then(result => {
        res.status(200).json({
            totalDataInDatabase: allData.length,
            amountDataDisplayed: result.length,
            data: result
        });
    }).catch(error => {
        res.status(500).json({
            message: "Please query your page and offset"
        });
    })

}

function update(req, res) {
    const id = req.params.id;
    const updatedData = {
        CustomerName: req.body.CustomerName,
        DatePurchase: req.body.DatePurchase,
        Discount__c: req.body.Discount__c,
        Amount_due__c: req.body.Amountdue__c,
        GST__c: req.body.GST__c,
        LastModifiedDate: Date.now(),
    }



    models.Data.update(updatedData, {
        where: {
            id: id
        }
    }).then(result => {
        res.status(200).json({
            message: "Data updated Successfully",
            data: updatedData
        });
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
            info: error
        });
    })

}

function store(req, res) {
    const data = {
        // Di sini data ID difaker random, karena untuk import data dari file, ada ID data yang menggunakan string + number. Jadi type data Id di database tidak bisa integer saja dan di auto increment. Jadi saya memutuskan pakai random aja dan tipenya varchar, dimana kurangnya adalah tidka bisa auto increment
        Id: faker.random.uuid(),
        CustomerName: req.body.CustomerName,
        DatePurchase: req.body.DatePurchase,
        Amount_due__c: req.body.Amount_due__c,
        Discount__c: req.body.Discount__c,
        GST__c: req.body.GST__c,
        CreatedDate: Date.now(),
        LastModifiedDate: Date.now()
    }

    // Validasi data menggunakan fastest-validator
    // Pembuatan schema. Optional false berarti required
    const schema = {
        CustomerName: {
            type: "string",
            optional: false,
            max: "100"
        },
        DatePurchase: {
            type: "string",
            optional: false,
            max: "500"
        },
        Amount_due__c: {
            type: "number",
            optional: false
        },
        Discount__c: {
            type: "number",
            optional: false
        },
        GST__c: {
            type: "number",
            optional: false
        }
    }

    // Inisiasi dan Validasi data terhadap schema
    const v = new Validator();
    const validationResponse = v.validate(data, schema);

    // Jika validasi tidak true maka kembalikan error
    if (validationResponse !== true) {
        return res.status(400).json({
            message: "Validation failed",
            errors: validationResponse
        });
    }

    // Berhasil validasi, lanjut store data
    models.Data.create(data).then(result => {
        res.status(200).json({
            message: "Data created Successfully",
            data: data
        });
    }).catch(error => {
        res.status(500).json({
            message: error
        });
    })

}

function destroy(req, res) {
    const id = req.params.id;

    models.Data.destroy({
        where: {
            id: id
        }
    }).then(result => {
        res.status(200).json({
            message: "Data deleted successfully"
        });
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong",
            error: error
        });
    });
}

async function exportExcel(req, res) {
    const data = await models.Data.findAll()
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    worksheet.columns = [{
            header: 'Id',
            key: 'Id'
        },
        {
            header: 'CustomerName',
            key: 'CustomerName'
        },
        {
            header: 'DatePurchase',
            key: 'DatePurchase'
        },
        {
            header: 'Amount_due__c',
            key: 'Amount_due__c'
        },
        {
            header: 'Discount__c',
            key: 'Discount__c'
        },
        {
            header: 'GST__c',
            key: 'GST__c'
        },
        {
            header: 'CreatedDate',
            key: 'CreatedDate'
        },
        {
            header: 'LastModifiedDate',
            key: 'LastModifiedDate'
        }
    ];

    data.forEach(datum => {
        worksheet.addRow(datum);
    });

    await workbook.xlsx.writeFile('./public/Data.xlsx').then(result => {
        // Generate file path
        const filePath = './public/Data.xlsx'

        // Mengembalikan file untuk didownload. Send and download di postman
        res.download(filePath)
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
            info: error
        });
    });
}

async function exportJson(req, res) {
    const data = await models.Data.findAll();
    fs.writeFile('./public/Data.json', JSON.stringify(data, null, 2), err => {
        if (err) {
            res.status(500).json({
                message: "Something went wrong!",
                info: err
            });
        } else {
            console.log("file created successfully");
            // Generate file path
            const filePath = './public/Data.json'

            // Mengembalikan file untuk didownload. Send and download di postman
            res.download(filePath)
        }
    })
}

function importJson(req, res) {
    fs.readFile('./data/RecruitmentTestData.json', 'utf-8', async (err, jsonData) => {

        // Mereplace tanda kutip satu (') menjadi kutip dua (") karena kutip satu error di JSON
        // Juga mereplace NULL string karena json file tidak bisa string NULL
        jsonData = jsonData.replaceAll("'", '"').replaceAll("NULL", null)

        // Membuat data menjadi JSON, karena saat data dibaca direadfile bentuknya string
        const data = JSON.parse(jsonData);

        // Input data sekaligus dengan bulkCreate, update on duplicate berguna jika ada data dengan id di input dengan di database, namun ada perubahan pada attributenya, maka data akan diupdate
        await models.Data.bulkCreate(data, {
            updateOnDuplicate: ["CustomerName", "DatePurchase", "Amount_due__c", "Discount__c", "GST__c", "CreatedDate", "LastModifiedDate"]
        }).then(result => {
            res.status(200).json({
                message: "Data imported Successfully",
                totalData: result.length
            });
        }).catch(error => {
            res.status(500).json({
                message: "Something went wrong!",
                info: error
            });
        })


    })
}

function importCsv(req, res) {

    // Path file CSV
    const csvFilePath = './data/RecruitmentTestData.csv'

    // Menggunakan library CSV untuk baca file
    csv({
        ignoreEmpty: true
    }).fromFile(csvFilePath).then(async (data) => {
        // Menggunakan kembali fungsi import csv
        await models.Data.bulkCreate(data, {
            updateOnDuplicate: ["CustomerName", "DatePurchase", "Amount_due__c", "Discount__c", "GST__c", "CreatedDate", "LastModifiedDate"]
        }).then(result => {
            res.status(200).json({
                message: "Data imported Successfully",
                totalData: result.length
            });
        }).catch(error => {
            res.status(500).json({
                message: "Something went wrong!",
                info: error
            });
        })
    })

}


module.exports = {
    index: index,
    pagination: pagination,
    show: show,
    update: update,
    store: store,
    destroy: destroy,
    exportExcel: exportExcel,
    exportJson: exportJson,
    importJson: importJson,
    importCsv: importCsv
}