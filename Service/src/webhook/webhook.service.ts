import { Injectable } from "@nestjs/common";
import { Repository, createQueryBuilder, getConnection } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { GroupEntity, QuestionEntity } from "../webhook/shared/entity/questions";
import { join } from "path";
const { convert } = require("html-to-text");
import * as fs from "fs";
import { User } from "../user.entity";
import { Userconv } from "src/twilio-concersation/userConvDetails.entity";
import { SocketGatewayWebHook } from "./ChatGatewayWebook";
var request = require("request");
// import { SocketGateway } from '../twilio-concersation/ChatGateway';
// import { MailerService } from "@nestjs-modules/mailer/dist";

@Injectable()
export class WebhookService {
    constructor(
         private socketGatewayWebHook: SocketGatewayWebHook,
        @InjectRepository(GroupEntity)
        private readonly questionGroupRepo: Repository<GroupEntity>,
        @InjectRepository(GroupEntity)
        private readonly questionRepo: Repository<QuestionEntity>,
        @InjectRepository(User)
        private readonly patientDetailsRepo: Repository<User>,
        @InjectRepository(Userconv)
        private userRepository: Repository<Userconv>,
        // private readonly mailerService: MailerService
    ) { }

    async getGroups() {
        try {
            let response = await this.questionGroupRepo.find();
            return response;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async sendRemainderNotification() {
        try {
            const today = new Date();
            const yyyy = today.getFullYear();
            var mm = "" + (today.getMonth() + 1); // Months start at 0!
            var dd = "" + today.getDate();

            if (+dd < 10) dd = "0" + dd;
            if (+mm < 10) mm = "0" + mm;

            const ofDate = dd + "-" + mm + "-" + yyyy;
            const userMobile = [];

            const token =
                "eyJhbG******************************************xcGNlVGtzSSJ9.eyJodHRwczovL*******************************************************************************************1HJaXPVg";

            // this.sendSMSNotification("Hi", '+919370555444', "dialogflow");
            console.log(ofDate + " - Getting User CarePlans....");


            var options = {
                method: "GET",
                url:
                    "https://dev.pregopowe***********81/v1/careplan/getPat*****************atetime=" +
                    ofDate +
                    "&limit=500&plancategory=undefined",
                headers: {
                    "content-type": "application/json",
                    Authorization: "Bearer " + token,
                },
            };
            request(options, (error, response, body) => {
                if (error) throw new Error(error);
                var plans = [];
                body = JSON.parse(body);
                if (body && body.data) {
                    body.data.forEach((data) => {
                        plans.push(data.plan.packageName.trim());
                    });
                }
                if (plans.length > 0) {
                    var msg =
                        "Hi there!\nYou have care plan assessment assigned for today -- \n\n";
                    plans.forEach((plan) => {
                        msg += plan + "\n";
                    });
                    msg = msg.substring(0, msg.length - 2);
                    // console.log("Plans found - " + plans);
                    msg +=
                        "\n\nClick the link here to start assessment - https://devp************ower.com/app/careplan/******";

                    // console.log("Getting User details....");
                    // Getting User details
                    var options1 = {
                        method: "POST",
                        url: " https://dev.pre***********81/v1/appl************rs/auth*********er",
                        headers: {
                            "content-type": "application/json",
                            Authorization: "Bearer " + token,
                        },
                        body: "",
                    };
                    request(options1, (error, response, body) => {
                        if (error) throw new Error(error);
                        body = JSON.parse(body);
                        body.data.userData.address.forEach((address) => {
                            address.telecom
                                .filter(
                                    (t) => t.type == "MOBILENO" || t.type == "ALTERNATIVEMOBILENO"
                                )
                                .forEach((mobNo) => {
                                    if (mobNo.value) {
                                        userMobile.push("+918485024889");
                                    }
                                });
                        });
                        // console.log(">>>>>",body.data.userData.name);
                        msg = msg.replace(
                            "Hi there!",
                            "Hi " +
                            body.data.userData.name.fname +
                            " " +
                            body.data.userData.name.lname +
                            ","
                        );
                        userMobile.forEach((mobile) => {
                            // Sending SMS notification to User Mobile
                            //this.sendSMSNotification(msg, mobile, "dialogflow");
                        });
                        this.getPatientInfo();
                    });
                }
            });
            return "response";
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getGroupQuestions(data) {
        try {
            const filename = join(
                __dirname,
                "../../assets/forms_files/form_" + data.groupid + ".json"
            );

            console.log("filename", filename);

            const options = {
                wordwrap: 130,
                selectors: [{ selector: "img", format: "skip" }],
            };
            var response = JSON.parse(fs.readFileSync(filename, "utf8"));
            response.forEach((question) => {
                question.parsedHtml = convert(question.html, options);
            });
            return response;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    sendSMSNotification(msg, mobile, via) {
        console.log("Sending SMSNotification via", via);
        if (via == "twilio") {
            var options = {
                method: "POST",
                url: "https://dia************29.tw***il.io/se*********ssage",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ Body: msg, To: mobile }),
            };

            request(options, (error, response, body) => {
                if (error) throw new Error(error);
                console.log(body);
            });
        } else if (via == "dialogflow") {
            var options = {
                method: "POST",
                url: "https://dialogflowservice-512***********o/chat**********om-df",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    Body: msg,
                    From: "whatsapp:" + mobile,
                    DfObject: {
                        contexts: {
                            msg: msg,
                        },
                        targetPage:
                            "projects/md-crhc-15**************************************31364ca4/flows/77a65c51**************17/pages/00206dbf-***************bf3f637d3c",
                    },
                }),
            };

            request(options, function (error, response, body) {
                if (error) throw new Error(error);
                console.log(body);
            });
        }
    }
    // NEW CODE -> START

    async getPatientInfo() {
        console.log("SUCCESSFULLY CALLED GETPATIENTINFO");
        try {
            const users = await this.patientDetailsRepo.find({ where: { is_reachable: false } });

            if (users.length > 0) {
                const user = users[0];

                let old_mobile = user.mobile_no;
                let alt_mobile = user.alt_mobile_no;
                let name = user.name; // + ' ' + query[0].lname;
                let msg = "";
                let email = user.email;
                let maskedMobileNumber = `${old_mobile.substr(0, 4)}XXXXXX${old_mobile.substr(10)}`;

                msg = "Hello " + name + ", we are unable to reach you on " + maskedMobileNumber + ". Do you want to change your mobile number?";
                let socketId = await this.getSocketIdByName(name);
                console.log("GOT THE SOCKET ID", socketId);
                if (socketId) {
                    console.log("GOT THE SOCKETID");
                    this.sendInAppMessage(msg, 'dialogflow', socketId, name);
                    // this.sendEMail(msgFrag1, msgFrag2, msgFrag3);
                } else {
                    console.log("Socket ID not found for user: ", name);
                }
                console.log("message: ", msg);
            } else {
                console.log('All mobile numbers are reachable at the moment.');

            }
        } catch (error) {
            console.log("Error occurred while fetching patient info:", error);
        }
    }

    async getUserSocketid(name: string): Promise<string> {
        // this.getPatientInfo();
        return this.getSocketIdByName(name);
    }

    async getSocketIdByName(name: string): Promise<string> {
        const userSocketDetails = await this.userRepository.findOne({ where: { name } });
        console.log("UserSocketDetails: ", userSocketDetails);
        return userSocketDetails ? userSocketDetails.socketId : null;
    }

    async sendInAppMessage(msg: string, via: 'dialogflow', socketId1: string, username: string) {
        var options = {
            method: "POST",
            url: "https://dialogf**********l.io/chat********df",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                Body: msg,
                From: "Dialogflow",
                //From: mobile_no,
                DfObject: {
                    contexts: {
                        msg: msg,
                    },
                    targetPage:
                        "projects/md-cr***********agents/1e02ab92-888******364ca4/flows/77a65c51**************cb3717/pages/00206*************88f637d3c",
                },
            }),
        };
        request(options, async function (error, response, body) {
            if (error) throw new Error(error);
            // console.log(body);

            let name = username;
            // const user = await this.userRepository.findOne({ where: { name } });
            let content = msg;
            let to = username;
            let from = via;
            let socketId = socketId1;
            // console.log("user :", user)
            if (socketId) {
                const data = { content, from, to, socketId };
                this.socketGatewayWebHook.handleMessage(null, data);
            }
        }.bind(this));
    }
    //NEW CODE -> END

    sendWhatsappMessage(msg, mobile_no, via: 'dialogflow') {
        var options = {
            method: "POST",
            url: "https://dialo***wil.io/cha*****-df",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                Body: msg,
                From: "whatsapp:" + mobile_no,
                //From: mobile_no,
                DfObject: {
                    contexts: {
                        msg: msg,
                    },
                    targetPage:
                        "projects/md-crhc-1*****84-4388-a681-8ce231364ca4/flows/77a65c****b3717/pages/00206db*****37d3c",
                },
            }),
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);
            console.log(body);
        });
    }

    async showPatients() {
        // let query = await getConnection().query("select * from userscreddetails where is_reachable=FALSE");
        const query = await this.patientDetailsRepo.findOne({ where: { is_reachable: false } });
        console.log(query);
        return query;
    }

    async updatePatientContact(data: any): Promise<User> {
         console.log("In the updatePatientContact");
        let old_mobile = data.old_phone_number;
        let new_mobile = data.new_phone_number;
        let year = data.year;
        let month = data.month;
        let date = data.day;
        // console.log(old_mobile);

        const patient = await this.patientDetailsRepo.findOne({
            where: { is_reachable: false }
        });

        if (patient) {
            patient.mobile_no = new_mobile;
            console.log("In the updatePatientContact if block");
            // let checkDob="0"+date+'-'+"0"+month+'-'+year;
            //let checkDob = this.addZero(month) + '-' + this.addZero(date) + '-' + year;
            let checkDob = year + '-' + this.addZero(month) + '-' + this.addZero(date);
            console.log(checkDob);
            if (checkDob == patient.dob) {
                console.log("patient dob :", patient.dob);
                patient.is_reachable = true;
                const updateContact = await this.patientDetailsRepo.save(patient);
                // console.log('updatecontact ',updateContact);
                return updateContact;
            }
        }
        console.log('patient: ', patient);
        return patient;
    }

    hasConversationId(): boolean {
        if ("") {
            return true;
        } else {
            return false;
        }
    }

    addZero(val) {
        return val < 10 ? '0' + val : '' + val;
    }

}
