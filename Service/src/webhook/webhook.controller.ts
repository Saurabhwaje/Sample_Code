import { Controller, Get, Req, Res, Post, Body, Param } from "@nestjs/common";
// import { Employee } from "../shared/interface/employee";
import { WebhookService } from "./webhook.service";
import { User } from "../user.entity";

@Controller('webhook')
export class WebhookController {
  constructor(private service: WebhookService) {}

  @Post('currentuser')
  async handleCurrentUserWebhook(@Body() body: { name: any }) {
    const { name } = body;
    const socketId = await this.service.sendRemainderNotification();
    console.log(`Socket ID for user ${name}: ${socketId}`);
  } 

  @Post()
  async getGroups(@Req() req, @Res() res, @Body() body) {
    try {
      var response = {};
      var qnaGroupId = body.sessionInfo.parameters.qnaGroupId;
      const qnaGroupAnswerAwaiting =
        body.sessionInfo.parameters.groupAnswerAwaiting;

      if (qnaGroupAnswerAwaiting) {
        qnaGroupId = body.text;
      }

      //groupId already provided, get question to ask
      if (qnaGroupId) {
        const groupQuestions = await this.service.getGroupQuestions({
          groupid: qnaGroupId,
        });
        var questionAsk = "";
        let currentQnAId = body.sessionInfo.parameters.currentQnAId;
        console.log("currentQnAId", currentQnAId);

        if (currentQnAId) {
          const currentIdx = groupQuestions.findIndex(
            (q) => q.id === currentQnAId
          );

          //getting answer in required format
          var answer = groupQuestions[currentIdx];
          answer.answer = body.text;

          //getting next question to ask
          if (currentIdx < groupQuestions.length - 1) {
            const question = groupQuestions[currentIdx + 1];
            questionAsk = this.prepareQuestion(question);
            currentQnAId = question.id;
          } else {
            questionAsk = "Thank you for answering. You will be redirected now...";
            currentQnAId = undefined;
          }
        } else {
          //no question asked previously, ask fresh question
          const question = groupQuestions[0];
          questionAsk = this.prepareQuestion(question);
          currentQnAId = question.id;
        }

        response = {
          fulfillment_response: {
            messages: [
              {
                text: {
                  text: [questionAsk],
                },
              },
            ],
          },
          sessionInfo: {
            session: "QuestionsToAsk",
            parameters: {
              qnaGroupId: qnaGroupId,
              currentQnAId: currentQnAId,
              groupAnswerAwaiting: false,
            },
          },
          targetPage:
            "projects/md-crhc-158013******************************1364ca4/flows/77a65c51-1***************b3717/pages/00206dbf-02e8-**********f637d3c",
        };
      } else {
        //groupId not provided, get groups to choose from
        const groups = await this.service.getGroups();
        var groupAsk = "Select QnA group to continue\n";

        groups.forEach((group) => {
          groupAsk += "\n" + group.id + ". " + group.name;
        });
        response = {
          fulfillment_response: {
            messages: [
              {
                text: {
                  text: [groupAsk],
                },
              },
            ],
          },
          sessionInfo: {
            session: "QuestionsToAsk",
            parameters: {
              groupAnswerAwaiting: true,
            },
          },
          targetPage:
            "projects/md-crhc**********************1/agents/1e02ab92-*****************364ca4/flows/77a65c51-1f6*****************3717/pages/00206dbf-0*******************f637d3c",
        };
      }
      return res.json(response);
    } catch (error) {
      return res.status(500).json({
        error,
      });
    }
  }
  
  
  @Post("sendRemainderNotification")
  async sendRemainderNotification(@Req() req, @Res() res, @Body() body) {
    try {
      const token = await this.service.sendRemainderNotification();
      return res.json(token);
    } catch (error) {
      return res.status(500).json({
        error,
      });
    }
  }

  @Post('updatePatientContact')
  async updatePatientContact(@Body() data: any): Promise<User>{
    console.log('controller data: ',data)
    const old_phone_number = data['old-phone-number'];
    const new_phone_number = data['phone-number'];
    const day = data.dob['day'];
    const month = data.dob['month'];
    const year = data.dob['year'];
    // console.log('day: ',day);
    let data1 = {
      'old_phone_number': old_phone_number,
      'new_phone_number': new_phone_number,
      'day': day,
      'month': month,
      'year': year
    };
    // console.log('data1', data1)
    return this.service.updatePatientContact(data1);
  }

  @Get('getPatientInfo')
  async getPatientInfo() {
    const patients =  await this.service.showPatients();
    return {
      patients
    };
  }

  prepareQuestion(question) {
    var questionAsk = "";
    questionAsk += question.parsedHtml;

    if (question.label) {
      questionAsk += "\n" + question.label;
    }

    console.log("question.type", question.type);
    console.log("question.values", question.values);

    if (question.type == "radio") {
      questionAsk += "\nSelect one from the followings";
      question.values.forEach((value, idx) => {
        questionAsk += "\n" + (idx + 1) + ". " + value.value;
      });
    }

    if (question.type == "select") {
      questionAsk +=
        "\nSelect from the followings. If multiple then answer as 1,2,3";
      question.values.forEach((value) => {
        questionAsk += "\n" + value.value;
      });
    }
    return questionAsk;
  }
}
