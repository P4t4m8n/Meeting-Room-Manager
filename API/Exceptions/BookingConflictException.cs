using System;

namespace API.Exceptions
{
    public class BookingConflictException : Exception
    {
        public BookingConflictException(string message) : base(message)
        {
        }
    }
}
