import { BadRequestException, Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

@Injectable()
export class AiService {
  private genAi: GoogleGenerativeAI;

  constructor() {
    this.genAi = new GoogleGenerativeAI(process.env.GOOGLE || '');
  }

  async processImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const model = this.genAi.getGenerativeModel({
      model: 'gemini-2.0-flash',
      safetySettings,
    });

    try {
      const content = await model.generateContent([
        "what is the handwriting inside this photo \noutput just the handwritten medicine (which refrences medicine that will be in one word at most with the concentration) in the photo with no additional text in this format (medicine name) (concentration) (mg, gm), if the handwritten isn't clear try to combine the characters you generated with the most similar medicine in characters",
        {
          inlineData: {
            data: file.buffer.toString('base64'),
            mimeType: file.mimetype,
          },
        },
      ]);

      const text = content.response.text();
      return { medicine: text };
    } catch (error) {
      throw new BadRequestException(`AI processing failed: ${error.message}`);
    }
  }
}
