import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as fse from 'fs-extra';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getProject(pid: string | number): string {
    try {
      // 读取数据
      const target = `data/iconfont/${pid}.json`;
      if (!fs.existsSync(target)) {
        return null;
      }
      const assets = fs.readFileSync(target, 'utf-8');
      return assets;
    } catch (e) {
      return null;
    }
  }

  setProject(pid: string | number, data: object): boolean {
    try {
      // 存储数据到/data/iconfont
      const target = `data/iconfont/${pid}.json`;
      fse.ensureFileSync(target);
      fse.writeJsonSync(target, data);
      return true;
    } catch (e) {
      return false;
    }
  }
}
