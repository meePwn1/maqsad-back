import { User as _User } from './user'
import { Student as _Student } from './student'
import { DeleteReason as _DeleteReason } from './delete_reason'
import { Refund as _Refund } from './refund'
import { Group as _Group } from './group'
import { Course as _Course } from './course'
import { Payment as _Payment } from './payment'
import { PaymentMethod as _PaymentMethod } from './payment_method'

export namespace PrismaModel {
  export class User extends _User {}
  export class Student extends _Student {}
  export class DeleteReason extends _DeleteReason {}
  export class Refund extends _Refund {}
  export class Group extends _Group {}
  export class Course extends _Course {}
  export class Payment extends _Payment {}
  export class PaymentMethod extends _PaymentMethod {}

  export const extraModels = [User, Student, DeleteReason, Refund, Group, Course, Payment, PaymentMethod]
}
