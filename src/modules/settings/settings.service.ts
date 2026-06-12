import { Injectable } from '@nestjs/common';
import { SettingsModel } from '../../models/settings.model';
import { UpdateSignatureDto } from './dto/update-signature.dto';

const COMPANY_SIGNATURE_KEY = 'company_signature_url';

@Injectable()
export class SettingsService {
  constructor(private readonly settingsModel: SettingsModel) {}

  async getCompanySignature(): Promise<{ signatureUrl: string | null }> {
    const signatureUrl = await this.settingsModel.getValue(COMPANY_SIGNATURE_KEY);
    return { signatureUrl };
  }

  async updateCompanySignature(dto: UpdateSignatureDto): Promise<{ signatureUrl: string }> {
    await this.settingsModel.setValue(COMPANY_SIGNATURE_KEY, dto.signatureUrl);
    return { signatureUrl: dto.signatureUrl };
  }
}
