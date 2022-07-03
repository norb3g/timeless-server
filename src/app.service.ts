import { Injectable } from '@nestjs/common';
import { Aggregate, Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Jewel, JewelDocument } from './JewelModel';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Jewel.name) private jewelModel: Model<JewelDocument>,
  ) {}

  async getJewels(
    type: string,
    ids: number[],
    weights: { [key: string]: number },
  ): Promise<any> {
    const match = { jewel: type };

    const passiveListObject = Object.fromEntries(
      ids.map((id) => {
        return [`info.${id}`, 1];
      }),
    );

    const projectionFilter = {
      seed: 1,
      ...passiveListObject,
    };

    const projectionReducer = {
      seed: 1,
      passives: {
        $reduce: {
          input: { $objectToArray: '$info' },
          initialValue: [],
          in: {
            $concatArrays: ['$$value', '$$this.v'],
          },
        },
      },
    };

    const newPassiveField = {
      passives: {
        $reduce: {
          input: '$passives',
          initialValue: [],
          in: {
            $concatArrays: [
              '$$value',
              [
                {
                  identifier: '$$this.identifier',
                  roll: '$$this.roll',
                  weight: {
                    $let: {
                      vars: {
                        desiredWeights: weights,
                      },
                      in: {
                        $multiply: [
                          '$$this.roll',
                          {
                            $cond: [
                              {
                                $in: [
                                  '$$this.identifier',
                                  {
                                    $map: {
                                      input: {
                                        $objectToArray: '$$desiredWeights',
                                      },
                                      as: 'weight_item',
                                      in: '$$weight_item.k',
                                    },
                                  },
                                ],
                              },
                              {
                                $arrayElemAt: [
                                  {
                                    $map: {
                                      input: {
                                        $filter: {
                                          input: {
                                            $objectToArray: '$$desiredWeights',
                                          },
                                          as: 'weight_item',
                                          cond: {
                                            $eq: [
                                              '$$weight_item.k',
                                              '$$this.identifier',
                                            ],
                                          },
                                        },
                                      },
                                      as: 'desiredWeight',
                                      in: '$$desiredWeight.v',
                                    },
                                  },
                                  0,
                                ],
                              },
                              0,
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            ],
          },
        },
      },
    };

    const newTotalWeightField = {
      totalWeight: {
        $reduce: {
          input: '$passives',
          initialValue: 0,
          in: {
            $add: ['$$value', '$$this.weight'],
          },
        },
      },
    };

    const sort = {
      totalWeight: -1,
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return await this.jewelModel
      .aggregate([
        { $match: match },
        { $project: projectionFilter },
        { $project: projectionReducer },
        { $addFields: newPassiveField },
        { $addFields: newTotalWeightField },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { $sort: sort },
        { $limit: 10 },
      ])
      .exec();
  }
}
