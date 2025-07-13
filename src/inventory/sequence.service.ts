import { Injectable } from '@nestjs/common';
import { InventorySequence } from './entities/sequence.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { retrieveCols } from '@nestjs/cli/actions';

@Injectable()
export class SequenceService {

  constructor(
    @InjectRepository(InventorySequence)
    private repo:   Repository<InventorySequence>
  ) {}
  // Solo lee cúal sería el siguiente correlativo, sin guarda
  async peek(prefix: 'IN'|'OUT'): Promise<string>{
    let seq = await this.repo.findOne({where: {prefix}});
    if(!seq){
      seq = this.repo.create({prefix, lastNumber: 0})
    }
    const nextNum = seq.lastNumber + 1;
    const num = nextNum.toString().padStart(4, '0');
    return `${prefix}-${num}`;
  }

  // Incrementa y devuelve el correlativo real (reserva número)
  async next(prefix: 'IN' | 'OUT'): Promise<string>{
    // Busca o crea la fila
    let seq = await this.repo.findOne({where: {prefix}});
    if(!seq){
      seq = this.repo.create({prefix, lastNumber: 0})
    }
    // Incrementa y guarda
    seq.lastNumber += 1;
    await this.repo.save(seq);
    //Formatea con ceros a la izquierda, ejemplo IN-001
    const num = seq.lastNumber.toString().padStart(4, '0');
    return `${prefix}-${num}`;
  }

}
