/**
 * Model that stores information about notifications,
 * such as SMS messages, sent by the app when students
 * request help and new sessions are created.
 */
import { Document, model, Schema, Types } from 'mongoose';

enum NotificationType {
  REGULAR = 'REGULAR',
  FAILSAFE = 'FAILSAFE'
}

enum NotificationMethod {
  SMS = 'SMS',
  VOICE = 'VOICE',
  EMAIL = 'EMAIL'
}

export interface Notification extends Document {
  volunteer: Types.ObjectId;
  sentAt: Date;
  type: NotificationType;
  method: NotificationMethod;
  wasSuccessful: boolean;
  messageId: string;
}

const notificationSchema = new Schema(
  {
    volunteer: {
      type: Types.ObjectId,
      ref: 'User'
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: [NotificationType.REGULAR, NotificationType.FAILSAFE],
      default: NotificationType.REGULAR
    },
    method: {
      type: String,
      enum: [
        NotificationMethod.SMS,
        NotificationMethod.VOICE,
        NotificationMethod.EMAIL
      ]
    },
    wasSuccessful: {
      type: Boolean,
      default: false
    },
    // Message ID returned by service, such as Twilio
    messageId: String
  },
  {
    toJSON: {
      virtuals: true
    },

    toObject: {
      virtuals: true
    }
  }
);

notificationSchema.virtual('session', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'notifications',
  justOne: true
});

export default model<Notification>('Notification', notificationSchema);
