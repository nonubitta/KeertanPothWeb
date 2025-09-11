import { Component } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-manage-pothi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-pothi.html',
  styleUrl: './manage-pothi.scss'
})
export class ManagePothi {
  parsedJson: any = null;
  jsonError: string = '';
  sortBy: string = 'select';

  onFileSelected(event: Event) {
    this.jsonError = '';
    this.parsedJson = null;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        try {
          this.parsedJson = JSON.parse(reader.result as string);
          //this.sortPothis(); // sort after loading if not custom
        } catch (e) {
          this.jsonError = 'Invalid JSON file.';
        }
      };
      reader.onerror = () => {
        this.jsonError = 'Error reading file.';
      };
      reader.readAsText(file);
    }
  }

  movePothiUp(i: number) {
    if (this.parsedJson && i > 0) {
      const temp = this.parsedJson[i - 1];
      this.parsedJson[i - 1] = this.parsedJson[i];
      this.parsedJson[i] = temp;
      this.sortBy = 'custom';
    }
  }

  movePothiDown(i: number) {
    if (this.parsedJson && i < this.parsedJson.length - 1) {
      const temp = this.parsedJson[i + 1];
      this.parsedJson[i + 1] = this.parsedJson[i];
      this.parsedJson[i] = temp;
      this.sortBy = 'custom';
    }
  }

  sortPothis() {
    if (!this.parsedJson) return;
    if (this.sortBy === 'nameAsc') {
      this.parsedJson.sort((a: any, b: any) => a.pothi.Name.localeCompare(b.pothi.Name));
    } else if (this.sortBy === 'nameDesc') {
      this.parsedJson.sort((a: any, b: any) => b.pothi.Name.localeCompare(a.pothi.Name));
    } else if (this.sortBy === 'dateAsc') {
      this.parsedJson.sort((a: any, b: any) => new Date(a.pothi.CreatedOn).getTime() - new Date(b.pothi.CreatedOn).getTime());
    } else if (this.sortBy === 'dateDesc') {
      this.parsedJson.sort((a: any, b: any) => new Date(b.pothi.CreatedOn).getTime() - new Date(a.pothi.CreatedOn).getTime());
    }
    // 'custom' does nothing, keeps current order
  }

  exportJson() {
    if (!this.parsedJson) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.parsedJson, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'pothis.json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}